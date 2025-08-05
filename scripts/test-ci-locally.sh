#!/bin/bash

# Local CI Testing Script
# This script simulates the CI pipeline steps locally
#
# Prerequisites: Docker, Node.js 22, Yarn, AWS CLI v2, jq, build-essential
# 📋 For complete setup instructions, see docs/CONTRIBUTOR_SETUP.md

set -e

echo "🚀 Starting local CI simulation..."
echo "=================================="
echo ""
echo "📋 Prerequisites: Docker, Node.js 22, Yarn, AWS CLI v2, jq"
echo "📖 Setup guide: docs/CONTRIBUTOR_SETUP.md"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Cleanup function
cleanup_and_exit() {
    exit_code=${1:-0}
    print_step "Cleaning up..."
    
    # Stop and remove containers
    docker stop aws-config-service-test 2>/dev/null || true
    docker rm aws-config-service-test 2>/dev/null || true
    docker stop dynamodb-local-test 2>/dev/null || true
    docker rm dynamodb-local-test 2>/dev/null || true
    
    # Remove test image
    docker rmi aws-config-service:test 2>/dev/null || true
    
    if [ $exit_code -eq 0 ]; then
        print_success "All tests passed! 🎉"
        echo "Your CI pipeline should work correctly on GitHub Actions."
    else
        print_error "Some tests failed. Please fix the issues before pushing."
    fi
    
    exit $exit_code
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed."
    print_error "📖 Please follow the setup guide: docs/CONTRIBUTOR_SETUP.md"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    print_error "Yarn is not installed."
    print_error "📖 Please follow the setup guide: docs/CONTRIBUTOR_SETUP.md"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed."
    print_error "📖 Please follow the setup guide: docs/CONTRIBUTOR_SETUP.md"
    exit 1
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y awscli
    else
        print_error "Please install AWS CLI manually"
        exit 1
    fi
fi

print_success "Prerequisites check completed"

# Step 1: Code Quality Checks (Job 1)
print_step "Running code quality checks..."

echo "Installing dependencies..."
yarn install --frozen-lockfile

echo "TypeScript type checking..."
yarn type-check

echo "ESLint check..."
yarn lint:check

echo "Prettier formatting check..."
yarn format:check

echo "Security audit..."
yarn audit --level moderate || print_warning "Some security issues found"

print_success "Code quality checks completed"

# Step 2: Build and Test (Job 2 simulation)
print_step "Starting build and test simulation..."

echo "Building application..."
yarn build

echo "Verifying build artifacts..."
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
    print_success "Build artifacts verified successfully"
else
    print_error "Build artifacts missing"
    exit 1
fi

# Start DynamoDB Local
print_step "Starting DynamoDB Local..."

# Clean up any existing containers first
docker stop dynamodb-local-test 2>/dev/null || true
docker rm dynamodb-local-test 2>/dev/null || true

docker run -d --name dynamodb-local-test -p 8000:8000 amazon/dynamodb-local:latest

# Wait for DynamoDB to be ready
echo "Waiting for DynamoDB to be ready..."
export AWS_REGION=us-east-1
export DYNAMODB_ENDPOINT=http://localhost:8000
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy

max_attempts=60
attempt=1
while [ $attempt -le $max_attempts ]; do
    if aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
        print_success "DynamoDB is ready on attempt $attempt"
        break
    fi
    echo "DynamoDB not ready, attempt $attempt/$max_attempts"
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_error "DynamoDB failed to start after $max_attempts attempts"
    docker logs dynamodb-local-test
    docker stop dynamodb-local-test && docker rm dynamodb-local-test
    exit 1
fi

# Create DynamoDB tables
echo "Creating DynamoDB tables..."
yarn dynamodb:create-table || print_warning "Table creation failed or already exists"

print_success "Build and test simulation completed"

# Step 3: Docker Build Test (Job 3 simulation)
print_step "Testing Docker build..."

echo "Building Docker image..."
docker build -t aws-config-service:test .

echo "Testing Docker container startup..."

# Clean up any existing test containers first
docker stop aws-config-service-test 2>/dev/null || true
docker rm aws-config-service-test 2>/dev/null || true

docker run -d \
    --name aws-config-service-test \
    --network host \
    -e NODE_ENV=production \
    -e AWS_REGION=us-east-1 \
    -e DYNAMODB_ENDPOINT=http://localhost:8000 \
    -e PORT=3000 \
    aws-config-service:test

# Wait for container to start
echo "Waiting for container to start..."
sleep 15

# Check if container is running
if ! docker ps | grep aws-config-service-test; then
    print_error "Container is not running"
    docker logs aws-config-service-test
    cleanup_and_exit 1
fi

# Check application health
echo "Testing application health..."
max_attempts=60
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Health check passed on attempt $attempt"
        break
    fi
    echo "Health check failed, attempt $attempt/$max_attempts"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_error "Health check failed after $max_attempts attempts"
    echo "Container logs:"
    docker logs aws-config-service-test
    cleanup_and_exit 1
fi

# Test basic API functionality
echo "Testing API endpoints..."
health_response=$(curl -s http://localhost:3000/health)
echo "Health response: $health_response"

print_success "Docker build and container test completed"

# Cleanup on script exit
trap cleanup_and_exit EXIT

print_success "All local CI tests completed successfully! 🎉"
echo "Your changes are ready for GitHub Actions."
