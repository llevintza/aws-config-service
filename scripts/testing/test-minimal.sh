#!/bin/bash

# Test just the health endpoint without the full CI pipeline
set -e

echo "🧪 Testing minimal health endpoint setup..."

# Clean up
docker stop aws-config-service-test 2>/dev/null || true
docker rm aws-config-service-test 2>/dev/null || true

# Build the latest version
echo "Building latest version..."
docker build -t aws-config-service:test .

# Start container with debug logging
echo "Starting container with debug output..."
docker run -d \
    --name aws-config-service-test \
    --network host \
    -e NODE_ENV=production \
    -e AWS_REGION=us-east-1 \
    -e PORT=3000 \
    aws-config-service:test

# Wait a bit for startup
echo "Waiting 5 seconds for startup..."
sleep 5

# Test health endpoint once quickly
echo "Testing health endpoint once..."
timeout 5 curl -f http://localhost:3000/health && echo "SUCCESS!" || echo "FAILED with exit code $?"

echo ""
echo "Container logs (last 50 lines):"
docker logs --tail 50 aws-config-service-test

# Cleanup
echo ""
echo "Cleaning up..."
docker stop aws-config-service-test 2>/dev/null || true
docker rm aws-config-service-test 2>/dev/null || true
