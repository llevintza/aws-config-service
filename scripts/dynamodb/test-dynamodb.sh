#!/bin/bash

# Quick DynamoDB Local Test
# Tests if DynamoDB Local is working properly
#
# Prerequisites: Docker, AWS CLI v2
# 📋 For complete setup instructions, see docs/CONTRIBUTOR_SETUP.md

set -e

echo "🧪 Testing DynamoDB Local setup..."

# Check prerequisites
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "📖 Please follow the setup guide: docs/CONTRIBUTOR_SETUP.md"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    echo "📖 Please follow the setup guide: docs/CONTRIBUTOR_SETUP.md"
    exit 1
fi

# Set environment variables
export AWS_REGION=us-east-1
export DYNAMODB_ENDPOINT=http://localhost:8000
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy

# Start DynamoDB Local
echo "Starting DynamoDB Local..."
docker run -d --name dynamodb-test -p 8000:8000 amazon/dynamodb-local:latest

# Function to cleanup
cleanup() {
    echo "Cleaning up..."
    docker stop dynamodb-test 2>/dev/null || true
    docker rm dynamodb-test 2>/dev/null || true
}

# Set trap for cleanup
trap cleanup EXIT

# Wait for DynamoDB to be ready
echo "Waiting for DynamoDB to be ready..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
        echo "✅ DynamoDB is ready on attempt $attempt"
        break
    fi
    echo "DynamoDB not ready, attempt $attempt/$max_attempts"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ DynamoDB failed to start"
    exit 1
fi

# Test table creation
echo "Testing table creation..."
yarn dynamodb:create-table

# Test table listing
echo "Testing table listing..."
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1

echo "✅ DynamoDB Local test completed successfully!"
