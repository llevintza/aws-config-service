#!/bin/bash

# Quick verification that the GitHub Actions fix will work
# This script tests the exact problematic step from GitHub Actions

set -e

echo "🔍 Verifying GitHub Actions DynamoDB connectivity fix"
echo "===================================================="

# Start DynamoDB exactly like GitHub Actions (using services)
echo "Starting DynamoDB container (simulating GitHub Actions services)..."
docker run -d --name dynamodb-verification -p 8000:8000 amazon/dynamodb-local:latest

echo "Waiting for container to start..."
sleep 10

# Check container status
if docker ps | grep dynamodb-verification; then
    echo "✅ DynamoDB container is running"
else
    echo "❌ DynamoDB container failed to start"
    exit 1
fi

# Install AWS CLI v2 exactly like GitHub Actions
echo "Installing AWS CLI v2 (GitHub Actions style)..."
sudo apt-get update -qq && sudo apt-get install -y -qq unzip
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install --update || sudo ./aws/install
rm -rf aws awscliv2.zip

echo "AWS CLI version: $(aws --version)"

# Test the exact problematic connectivity step with environment variables
echo ""
echo "Testing the EXACT problematic step from GitHub Actions..."
echo "========================================================="

export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy

# This is the exact code from the GitHub Actions step that was failing
echo "Waiting for DynamoDB to respond..."
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
    
    # Cleanup before exit
    docker stop dynamodb-verification 2>/dev/null || true
    docker rm dynamodb-verification 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 SUCCESS! The GitHub Actions fix is working correctly!"
echo "The 'Wait for DynamoDB to respond' step should now pass."

# Cleanup
echo "Cleaning up..."
docker stop dynamodb-verification 2>/dev/null || true
docker rm dynamodb-verification 2>/dev/null || true

echo ""
echo "✅ You can now confidently push your changes to GitHub!"
echo "✅ The ci.yml Docker job should complete successfully!"
