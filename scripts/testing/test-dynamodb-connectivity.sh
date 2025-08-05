#!/bin/bash

# Test DynamoDB connectivity exactly like GitHub Actions
# This script mimics the "Wait for DynamoDB to respond" step from ci.yml

set -e

echo "🔧 Testing DynamoDB connectivity (mimicking GitHub Actions Docker job)"
echo "=================================================================="

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Installing..."
    
    # Install AWS CLI v2 (same as GitHub Actions)
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install --update || sudo ./aws/install
    rm -rf aws awscliv2.zip
    
    echo "✅ AWS CLI v2 installed"
fi

echo "AWS CLI version: $(aws --version)"

# Check if DynamoDB container is running
echo ""
echo "=== Checking DynamoDB Container Status ==="
if docker ps | grep dynamodb; then
    echo "✅ DynamoDB container is running"
else
    echo "❌ DynamoDB container not found"
    echo "Starting DynamoDB with docker-compose..."
    
    # Start DynamoDB using the test compose file
    if [ -f "docker-compose.dynamodb-test.yml" ]; then
        # Try docker-compose first, then docker compose as fallback
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose.dynamodb-test.yml up -d dynamodb-test
        else
            docker compose -f docker-compose.dynamodb-test.yml up -d dynamodb-test
        fi
        echo "✅ Started DynamoDB container"
        sleep 5
    else
        echo "❌ docker-compose.dynamodb-test.yml not found"
        echo "Available compose files:"
        ls docker-compose*.yml 2>/dev/null || echo "No compose files found"
        exit 1
    fi
fi

# Check network connectivity (same as GitHub Actions)
echo ""
echo "=== Network Connectivity Test ==="
if netstat -tlnp | grep :8000; then
    echo "✅ Port 8000 is listening"
else
    echo "❌ Port 8000 is not listening"
    echo "All listening ports:"
    netstat -tlnp | grep LISTEN
    exit 1
fi

# Wait for DynamoDB to respond (exact same logic as GitHub Actions)
echo ""
echo "=== Wait for DynamoDB to respond ==="
echo "Waiting for DynamoDB to respond..."

# Set AWS environment variables (same as GitHub Actions)
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy

max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Testing DynamoDB connectivity"
    
    # Test AWS CLI functionality directly (DynamoDB Local doesn't respond to basic HTTP requests)
    if aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
        echo "✅ DynamoDB is ready and responding to AWS CLI"
        break
    else
        echo "⚠️ DynamoDB not responding to AWS CLI - attempt $attempt/$max_attempts"
        
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
    echo "❌ DynamoDB failed to respond after $max_attempts attempts"
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

# Test table verification (same as next step in GitHub Actions)
echo ""
echo "=== Verify DynamoDB tables exist ==="
tables=$(aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 --output text --query 'TableNames' 2>/dev/null || echo "")
echo "Available tables: $tables"

if [ -z "$tables" ] || [ "$tables" = "None" ]; then
    echo "⚠️ No DynamoDB tables found - this is expected if no tables have been created yet"
    echo "You can create tables with: yarn dynamodb:create-table"
else
    echo "✅ DynamoDB tables are available: $tables"
fi

echo ""
echo "🎉 DynamoDB connectivity test completed successfully!"
echo "This indicates the GitHub Actions Docker job should work."

# Export environment variables for further testing
export AWS_REGION=us-east-1
export DYNAMODB_ENDPOINT=http://localhost:8000
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy

echo ""
echo "Environment variables set for local testing:"
echo "  AWS_REGION=$AWS_REGION"
echo "  DYNAMODB_ENDPOINT=$DYNAMODB_ENDPOINT"
echo "  AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "  AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
