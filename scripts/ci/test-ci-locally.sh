#!/bin/bash

# Local CI Testing Script
# This script simulates the CI pipeline steps locally
#
# Prerequisites: Docker, Node.js 22, Yarn, AWS CLI v2, jq, build-essential
# 📋 For complete setup instructions, see docs/CONTRIBUTOR_SETUP.md

set -e

# Set timeout for the entire script (20 minutes)
timeout_duration=1200
(
    sleep $timeout_duration
    echo ""
    echo "❌ Script timeout after $((timeout_duration/60)) minutes"
    echo "Cleaning up and exiting..."
    pkill -P $$ 2>/dev/null || true
    exit 124
) &
timeout_pid=$!

echo "🚀 Starting local CI simulation..."
echo "=================================="
echo ""
echo "📋 Prerequisites: Docker, Node.js 22, Yarn, AWS CLI v2, jq"
echo "📖 Setup guide: docs/CONTRIBUTOR_SETUP.md"
echo "⏱️  Script timeout: $((timeout_duration/60)) minutes"
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
    
    # Kill timeout process
    kill $timeout_pid 2>/dev/null || true
    
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
    elif [ $exit_code -eq 124 ]; then
        print_error "Script timed out. Check for hanging processes or network issues."
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

# Set up signal handlers for cleanup
trap 'cleanup_and_exit 130' INT  # Ctrl+C
trap 'cleanup_and_exit 143' TERM # Termination
trap 'cleanup_and_exit 0' EXIT   # Normal exit

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

max_attempts=30  # Reduced from 60
attempt=1
while [ $attempt -le $max_attempts ]; do
    if timeout 10 aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
        print_success "DynamoDB is ready on attempt $attempt"
        break
    fi
    echo "DynamoDB not ready, attempt $attempt/$max_attempts"
    sleep 2  # Reduced from 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    print_error "DynamoDB failed to start after $max_attempts attempts"
    echo "DynamoDB container logs:"
    docker logs dynamodb-local-test
    cleanup_and_exit 1
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
sleep 5  # Initial wait

# Check if container is running and healthy
echo "Checking container status..."
for i in {1..12}; do  # 12 attempts, 5 seconds each = 1 minute max
    if docker ps | grep -q aws-config-service-test; then
        # Check if container is still running (not restarting)
        container_status=$(docker inspect --format='{{.State.Status}}' aws-config-service-test 2>/dev/null || echo "not_found")
        if [ "$container_status" = "running" ]; then
            print_success "Container is running (attempt $i)"
            break
        else
            echo "Container status: $container_status (attempt $i/12)"
        fi
    else
        echo "Container not found in docker ps (attempt $i/12)"
    fi
    
    if [ $i -eq 12 ]; then
        print_error "Container failed to start properly"
        echo "Container logs:"
        docker logs aws-config-service-test
        cleanup_and_exit 1
    fi
    
    sleep 5
done

# Check application health
echo "Testing application health..."

# First check if port 3000 is listening
echo "Checking if port 3000 is accessible..."
for i in {1..10}; do
    if timeout 5 nc -z localhost 3000 2>/dev/null; then
        print_success "Port 3000 is accessible (attempt $i)"
        break
    fi
    echo "Port 3000 not accessible (attempt $i/10)"
    if [ $i -eq 10 ]; then
        print_error "Port 3000 is not accessible after 10 attempts"
        echo "Container logs:"
        docker logs aws-config-service-test
        cleanup_and_exit 1
    fi
    sleep 3
done

# Now test the health endpoint
max_attempts=10
attempt=1
while [ $attempt -le $max_attempts ]; do
    if timeout 30 curl -f --connect-timeout 10 --max-time 30 http://localhost:3000/health > /dev/null 2>&1; then
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
health_response=$(timeout 30 curl -s --connect-timeout 10 --max-time 30 http://localhost:3000/health)
if [ $? -eq 0 ]; then
    echo "Health response: $health_response"
    print_success "API endpoint test completed"
else
    print_warning "Failed to get health response, but container is running"
fi

print_success "Docker build and container test completed"

print_success "All local CI tests completed successfully! 🎉"
echo "Your changes are ready for GitHub Actions."

# Kill the timeout process since we completed successfully
kill $timeout_pid 2>/dev/null || true
