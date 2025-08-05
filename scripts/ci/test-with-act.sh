#!/bin/bash

# Install act if not already installed
if ! command -v act &> /dev/null; then
    echo "Installing act (GitHub Actions local runner)..."
    curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
fi

# Create a minimal workflow to test just the docker job
mkdir -p .github/workflows-test

cat > .github/workflows-test/test-docker.yml << 'EOF'
name: Test Docker Job

on: [push]

jobs:
  docker:
    name: Docker Build & Security Scan
    runs-on: ubuntu-latest

    services:
      dynamodb:
        image: amazon/dynamodb-local:latest
        ports:
          - 8000:8000

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: false
          tags: aws-config-service:test
          platforms: linux/amd64
          load: true

      - name: Setup Node.js for table creation
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'yarn'

      - name: Install dependencies for DynamoDB setup
        run: yarn install --frozen-lockfile

      - name: Create DynamoDB tables
        run: |
          curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
          unzip awscliv2.zip
          sudo ./aws/install --update || sudo ./aws/install
          
          max_attempts=30
          attempt=1
          while [ $attempt -le $max_attempts ]; do
            if aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1 > /dev/null 2>&1; then
              break
            fi
            sleep 3
            attempt=$((attempt + 1))
          done
          
          yarn dynamodb:create-table
        env:
          AWS_REGION: us-east-1
          DYNAMODB_ENDPOINT: http://localhost:8000
          AWS_ACCESS_KEY_ID: dummy
          AWS_SECRET_ACCESS_KEY: dummy

      - name: Test container startup
        run: |
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
          
          sleep 20
          
          max_attempts=30
          attempt=1
          while [ $attempt -le $max_attempts ]; do
            if curl -f http://localhost:3000/health > /dev/null 2>&1; then
              echo "✅ Health check passed"
              break
            fi
            sleep 2
            attempt=$((attempt + 1))
          done
          
          docker stop aws-config-service-test
          docker rm aws-config-service-test
EOF

# Run the test workflow
echo "🧪 Running GitHub Actions workflow locally..."
act -W .github/workflows-test/test-docker.yml

# Cleanup
rm -rf .github/workflows-test
