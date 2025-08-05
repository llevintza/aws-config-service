#!/bin/bash

# Test script to simulate the GitHub Actions Docker job locally
set -e  # Exit on any error

echo "🧪 Testing Docker job locally..."

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    docker stop aws-config-service-test 2>/dev/null || true
    docker rm aws-config-service-test 2>/dev/null || true
    docker stop dynamodb-local-test 2>/dev/null || true
    docker rm dynamodb-local-test 2>/dev/null || true
}
trap cleanup EXIT

# Step 1: Start DynamoDB Local (simulating GitHub Actions service)
echo "📦 Starting DynamoDB Local container..."
docker run -d \
    --name dynamodb-local-test \
    -p 8000:8000 \
    amazon/dynamodb-local:latest

sleep 10

# Step 2: Install testing tools (skip if already installed)
echo "🔧 Checking testing tools..."
if ! command -v jq &> /dev/null; then
    echo "Installing jq..."
    sudo apt-get update && sudo apt-get install -y jq
fi

# Step 3: Install AWS CLI v2 (skip if already installed)
echo "☁️ Checking AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI v2..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Step 4: Verify DynamoDB container status
echo "🔍 Verifying DynamoDB container..."
if docker ps | grep dynamodb-local-test; then
    echo "✅ DynamoDB container is running"
else
    echo "❌ DynamoDB container not found"
    docker ps -a
    exit 1
fi

# Step 5: Check network connectivity
echo "🌐 Checking network connectivity..."
if netstat -tlnp | grep :8000; then
    echo "✅ Port 8000 is listening"
else
    echo "❌ Port 8000 is not listening"
    netstat -tlnp
    exit 1
fi

# Step 6: Wait for DynamoDB to respond
echo "⏳ Waiting for DynamoDB to respond..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Testing DynamoDB connectivity"
    
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        echo "✅ DynamoDB port is accessible"
        
        if AWS_REGION=us-east-1 AWS_ACCESS_KEY_ID=dummy AWS_SECRET_ACCESS_KEY=dummy \
           aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
            echo "✅ DynamoDB is ready and responding to AWS CLI"
            break
        else
            echo "⚠️ DynamoDB port accessible but AWS CLI failed"
        fi
    else
        echo "⚠️ DynamoDB port not accessible"
    fi
    
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ DynamoDB failed to respond after $max_attempts attempts"
    docker logs dynamodb-local-test
    exit 1
fi

# Step 7: Install dependencies and create tables
echo "📚 Installing dependencies..."
yarn install --frozen-lockfile

echo "🗄️ Creating DynamoDB tables..."
AWS_REGION=us-east-1 DYNAMODB_ENDPOINT=http://localhost:8000 AWS_ACCESS_KEY_ID=dummy AWS_SECRET_ACCESS_KEY=dummy \
yarn dynamodb:create-table

# Step 8: Verify tables exist
echo "🔍 Verifying DynamoDB tables..."
tables=$(AWS_REGION=us-east-1 AWS_ACCESS_KEY_ID=dummy AWS_SECRET_ACCESS_KEY=dummy \
         aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 --output text --query 'TableNames')
echo "Available tables: $tables"

if [ -z "$tables" ] || [ "$tables" = "None" ]; then
    echo "❌ No DynamoDB tables found"
    exit 1
else
    echo "✅ DynamoDB tables are available"
fi

# Step 9: Build Docker image
echo "🐳 Building Docker image..."
yarn build
docker build -t aws-config-service:test .

# Step 10: Start application container
echo "🚀 Starting application container..."
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

echo "✅ Container started with ID: $(docker ps -q --filter name=aws-config-service-test)"

# Step 11: Wait for container to be ready
echo "⏳ Waiting for container to start..."
sleep 20

if ! docker ps | grep aws-config-service-test; then
    echo "❌ Container is not running"
    echo "Container logs:"
    docker logs aws-config-service-test
    exit 1
fi

echo "✅ Container is running"

# Step 12: Test application health
echo "🏥 Testing application health..."
max_attempts=60
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Health check passed on attempt $attempt"
        break
    fi
    
    echo "⚠️ Health check failed, attempt $attempt/$max_attempts"
    
    if [ $((attempt % 10)) -eq 0 ]; then
        echo "Recent container logs:"
        docker logs --tail 10 aws-config-service-test
    fi
    
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Health check failed after $max_attempts attempts"
    echo "=== Final Container Logs ==="
    docker logs aws-config-service-test
    exit 1
fi

# Step 13: Test API functionality
echo "🔗 Testing API functionality..."
health_response=$(curl -s http://localhost:3000/health)
echo "Health response: $health_response"

if echo "$health_response" | jq . > /dev/null 2>&1; then
    echo "✅ API returned valid JSON"
else
    echo "⚠️ API response is not valid JSON"
fi

# Step 14: Test container DynamoDB connectivity
echo "🔗 Testing DynamoDB connectivity from container..."
if docker exec aws-config-service-test sh -c "curl -f http://localhost:8000/ > /dev/null 2>&1"; then
    echo "✅ DynamoDB accessible from container"
else
    echo "⚠️ DynamoDB not accessible from container"
fi

echo ""
echo "🎉 All tests passed! The Docker job should work in CI."
echo ""
