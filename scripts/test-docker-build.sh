#!/bin/bash

# Quick Docker Build Test
# Tests if the Docker image builds successfully

set -e

echo "🐳 Testing Docker build..."

# Build the image
echo "Building Docker image..."
docker build -t aws-config-service:test .

# Test if image was created
if docker images | grep -q "aws-config-service.*test"; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Docker image build failed"
    exit 1
fi

# Test basic container run
echo "Testing container startup..."
docker run --rm aws-config-service:test node --version

echo "✅ Docker build test completed successfully!"

# Cleanup
echo "Cleaning up test image..."
docker rmi aws-config-service:test
