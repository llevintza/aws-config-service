#!/bin/bash

# Quick Docker Build Test
# Tests if the Docker image builds successfully
#
# Prerequisites: Docker
# 📋 For complete setup instructions, see docs/CONTRIBUTOR_SETUP.md

set -e

echo "🐳 Testing Docker build..."

# Check prerequisites
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "📖 Please follow the setup guide: docs/CONTRIBUTOR_SETUP.md"
    exit 1
fi

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
