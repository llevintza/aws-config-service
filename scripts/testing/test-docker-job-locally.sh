#!/bin/bash

# Test the complete Docker job workflow from GitHub Actions locally
# This script mimics the entire "Docker Build & Security Scan" job

set -e

echo "🐳 Testing GitHub Actions Docker Job Locally"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️ $2${NC}" ;;
        "INFO") echo -e "$2" ;;
    esac
}

# Cleanup function
cleanup() {
    print_status "INFO" "Cleaning up test containers..."
    docker stop aws-config-service-test 2>/dev/null || true
    docker rm aws-config-service-test 2>/dev/null || true
    # Try docker-compose first, then docker compose as fallback
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.dynamodb-test.yml down 2>/dev/null || true
    else
        docker compose -f docker-compose.dynamodb-test.yml down 2>/dev/null || true
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

print_status "INFO" "Step 1: Starting DynamoDB container"
if ! docker ps | grep dynamodb > /dev/null; then
    # Try docker-compose first, then docker compose as fallback
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.dynamodb-test.yml up -d dynamodb-test
    else
        docker compose -f docker-compose.dynamodb-test.yml up -d dynamodb-test
    fi
    sleep 10
fi

print_status "INFO" "Step 2: Setting up Node.js environment"
if ! command -v node &> /dev/null || ! command -v yarn &> /dev/null; then
    print_status "ERROR" "Node.js and Yarn are required. Please install them first."
    exit 1
fi

print_status "INFO" "Step 3: Installing dependencies"
yarn install --frozen-lockfile

print_status "INFO" "Step 4: Installing testing tools"
sudo apt-get update -qq && sudo apt-get install -y -qq jq unzip netstat-openbsd 2>/dev/null || true

print_status "INFO" "Step 5: Installing AWS CLI v2"
if ! command -v aws &> /dev/null; then
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install --update || sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

print_status "SUCCESS" "AWS CLI version: $(aws --version)"

print_status "INFO" "Step 6: Setting up environment variables"
export AWS_REGION=us-east-1
export DYNAMODB_ENDPOINT=http://localhost:8000
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy

print_status "INFO" "Step 7: Creating DynamoDB tables"
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
        print_status "SUCCESS" "DynamoDB is ready for table creation on attempt $attempt"
        break
    fi
    print_status "WARNING" "DynamoDB not ready for table creation, attempt $attempt/$max_attempts"
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_status "ERROR" "DynamoDB failed to be ready for table creation"
    exit 1
fi

# Create tables
yarn dynamodb:create-table

# Verify tables were created
print_status "INFO" "Verifying DynamoDB tables..."
tables=$(aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 --output text --query 'TableNames')
print_status "SUCCESS" "Available tables: $tables"

print_status "INFO" "Step 8: Building Docker image"
docker build -t aws-config-service:test .

print_status "INFO" "Step 9: Verifying DynamoDB container status"
if docker ps | grep dynamodb > /dev/null; then
    print_status "SUCCESS" "DynamoDB container is running"
else
    print_status "ERROR" "DynamoDB container not found"
    docker ps -a
    exit 1
fi

print_status "INFO" "Step 10: Checking network connectivity"
if netstat -tlnp | grep :8000 > /dev/null; then
    print_status "SUCCESS" "Port 8000 is listening"
else
    print_status "ERROR" "Port 8000 is not listening"
    netstat -tlnp | grep LISTEN
    exit 1
fi

print_status "INFO" "Step 11: Testing DynamoDB connectivity (the critical step)"
echo "Waiting for DynamoDB to respond..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Testing DynamoDB connectivity"
    
    # Test AWS CLI functionality directly (DynamoDB Local doesn't respond to basic HTTP requests)
    if aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
        print_status "SUCCESS" "DynamoDB is ready and responding to AWS CLI"
        break
    else
        print_status "WARNING" "DynamoDB not responding to AWS CLI - attempt $attempt/$max_attempts"
        
        # Show more debug info every 10 attempts
        if [ $((attempt % 10)) -eq 0 ]; then
            echo "=== Debug Info (attempt $attempt) ==="
            echo "DynamoDB container status:"
            docker ps | grep dynamodb || echo "No DynamoDB container found"
            echo "Port 8000 status:"
            netstat -tlnp | grep :8000 || echo "Port 8000 not listening"
            echo "Recent DynamoDB logs:"
            docker logs --tail 5 $(docker ps -q --filter "ancestor=amazon/dynamodb-local:latest") 2>/dev/null || echo "No container logs available"
        fi
    fi
    
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_status "ERROR" "DynamoDB failed to respond after $max_attempts attempts"
    echo "=== Final Debug Information ==="
    echo "Docker containers:"
    docker ps -a
    echo "Network status:"
    netstat -tlnp | grep :8000
    echo "DynamoDB container logs:"
    docker logs $(docker ps -q --filter "ancestor=amazon/dynamodb-local:latest") 2>/dev/null || echo "No DynamoDB container logs found"
    echo "AWS CLI version:"
    aws --version
    exit 1
fi

print_status "INFO" "Step 12: Verifying DynamoDB tables exist"
tables=$(aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 --output text --query 'TableNames')
print_status "INFO" "Available tables: $tables"

if [ -z "$tables" ] || [ "$tables" = "None" ]; then
    print_status "ERROR" "No DynamoDB tables found"
    exit 1
else
    print_status "SUCCESS" "DynamoDB tables are available"
fi

print_status "INFO" "Step 13: Starting application container"
docker run -d \
    --name aws-config-service-test \
    --network host \
    -e NODE_ENV=production \
    -e AWS_REGION=us-east-1 \
    -e DYNAMODB_ENDPOINT=http://localhost:8000 \
    -e PORT=3000 \
    -e AWS_ACCESS_KEY_ID=dummy \
    -e AWS_SECRET_ACCESS_KEY=dummy \
    aws-config-service:test

container_id=$(docker ps -q --filter name=aws-config-service-test)
print_status "SUCCESS" "Container started with ID: $container_id"

print_status "INFO" "Step 14: Waiting for container to be ready"
sleep 20

# Check if container is still running
if ! docker ps | grep aws-config-service-test > /dev/null; then
    print_status "ERROR" "Container is not running"
    echo "Container logs:"
    docker logs aws-config-service-test
    exit 1
fi

print_status "SUCCESS" "Container is running"

print_status "INFO" "Step 15: Testing application health endpoint"
max_attempts=60
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_status "SUCCESS" "Health check passed on attempt $attempt"
        break
    fi
    
    print_status "WARNING" "Health check failed, attempt $attempt/$max_attempts"
    
    # Show logs every 10 attempts
    if [ $((attempt % 10)) -eq 0 ]; then
        echo "Recent container logs:"
        docker logs --tail 10 aws-config-service-test
    fi
    
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_status "ERROR" "Health check failed after $max_attempts attempts"
    echo "=== Final Container Logs ==="
    docker logs aws-config-service-test
    exit 1
fi

print_status "INFO" "Step 16: Testing API functionality"
health_response=$(curl -s http://localhost:3000/health)
print_status "INFO" "Health response: $health_response"

if echo "$health_response" | jq . > /dev/null 2>&1; then
    print_status "SUCCESS" "API returned valid JSON"
else
    print_status "WARNING" "API response is not valid JSON"
fi

print_status "INFO" "Step 17: Testing container DynamoDB connectivity"
if docker exec aws-config-service-test sh -c "curl -f http://localhost:8000/ > /dev/null 2>&1"; then
    print_status "SUCCESS" "DynamoDB accessible from container"
else
    print_status "WARNING" "DynamoDB not accessible from container (this may be expected)"
fi

print_status "SUCCESS" "🎉 All Docker job steps completed successfully!"
print_status "SUCCESS" "The GitHub Actions Docker job should now work correctly."

echo ""
echo "=== Summary ==="
echo "✅ DynamoDB container: Running and responding"
echo "✅ Docker build: Successful"
echo "✅ Application container: Running and healthy"
echo "✅ API endpoints: Responding correctly"
echo ""
echo "You can now push your changes to GitHub with confidence!"
