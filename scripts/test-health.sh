#!/bin/bash

# Simple test script to verify health endpoint is working
set -e

echo "🧪 Testing health endpoint directly..."

# Clean up any existing containers
docker stop aws-config-service-test 2>/dev/null || true
docker rm aws-config-service-test 2>/dev/null || true

# Start the container
echo "Starting container..."
docker run -d \
    --name aws-config-service-test \
    --network host \
    -e NODE_ENV=production \
    -e AWS_REGION=us-east-1 \
    -e DYNAMODB_ENDPOINT=http://localhost:8000 \
    -e PORT=3000 \
    aws-config-service:test

# Wait for container to start
echo "Waiting 10 seconds for container to start..."
sleep 10

# Test with different approaches
echo "Testing with timeout 10 seconds..."
timeout 10 curl -v http://localhost:3000/health || echo "Curl failed with exit code $?"

echo ""
echo "Testing with different timeout..."
timeout 5 curl -f --connect-timeout 3 --max-time 5 http://localhost:3000/health || echo "Second curl failed with exit code $?"

echo ""
echo "Container logs:"
docker logs aws-config-service-test

echo ""
echo "Container status:"
docker ps | grep aws-config-service-test || echo "Container not running"

# Cleanup
docker stop aws-config-service-test 2>/dev/null || true
docker rm aws-config-service-test 2>/dev/null || true
