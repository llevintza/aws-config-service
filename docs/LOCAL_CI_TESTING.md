# Local CI Testing Guide

This document explains how to test your CI pipeline locally before pushing to GitHub Actions.

## Quick Start

### 1. **Full CI Simulation**

```bash
# Run the complete CI pipeline simulation
yarn ci:test-local
```

### 2. **Individual Component Tests**

#### Code Quality Checks

```bash
yarn ci:quality-check
```

#### DynamoDB Local Test

```bash
yarn ci:test-dynamodb
```

#### Docker Build Test

```bash
yarn ci:test-docker
```

#### Docker Compose Test

```bash
yarn ci:test-compose
```

## Prerequisites

⚠️ **Before running any local CI tests, ensure your development environment is properly set up.**

📋 **For complete setup instructions, see [CONTRIBUTOR_SETUP.md](./CONTRIBUTOR_SETUP.md)**

### Required Software

- **Docker**: Container testing and DynamoDB Local
- **Node.js 22**: Runtime compatibility with CI environment
- **Yarn**: Package manager
- **AWS CLI v2**: DynamoDB Local interaction and testing
- **jq**: JSON processing in CI scripts
- **build-essential**: Native module compilation

### Quick Verification

Run this command to verify all prerequisites are installed:

```bash
echo "=== Checking CI Prerequisites ==="
node --version    # Should show v22.x.x
yarn --version    # Should show 1.22.x+
docker --version  # Should show Docker version
aws --version     # Should show aws-cli/2.x.x
jq --version      # Should show jq version
echo "=== All checks complete ==="
```

If any command fails, follow the [CONTRIBUTOR_SETUP.md](./CONTRIBUTOR_SETUP.md) guide.

### Installation Commands

⚠️ **The commands below are abbreviated. For complete setup instructions, see [CONTRIBUTOR_SETUP.md](./CONTRIBUTOR_SETUP.md)**

#### Ubuntu/Debian (Quick Reference)

```bash
# For complete setup, see CONTRIBUTOR_SETUP.md

# Install Docker
sudo apt update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt-get install -y unzip
unzip awscliv2.zip && sudo ./aws/install && rm -rf awscliv2.zip aws/

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt-get install -y jq build-essential
npm install -g yarn
```

#### macOS (Quick Reference)

```bash
# For complete setup, see CONTRIBUTOR_SETUP.md

# Install prerequisites
brew install --cask docker
brew install awscli node@22 yarn jq
brew link node@22
```

## Testing Strategies

### 1. **Incremental Testing**

Test components one by one:

```bash
# 1. Code quality
yarn type-check
yarn lint:check
yarn format:check

# 2. Build
yarn build

# 3. DynamoDB setup
yarn ci:test-dynamodb

# 4. Docker build
yarn ci:test-docker

# 5. Full integration
yarn ci:test-local
```

### 2. **GitHub Actions Local Testing (act)**

Install act:

```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

Test specific jobs:

```bash
# Test individual jobs
act -j code-quality
act -j build-and-test
act -j docker

# Test specific events
act push
act pull_request
```

### 3. **Docker Compose Testing**

```bash
# Test with Docker Compose
yarn ci:test-compose

# Or manually
docker-compose -f docker-compose.ci-test.yml up --build
```

## Troubleshooting

### Common Issues

#### Docker Permission Denied

```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

#### DynamoDB Connection Issues

```bash
# Check if port 8000 is available
lsof -i :8000

# Check DynamoDB container logs
docker logs dynamodb-local-test
```

#### AWS CLI Configuration

```bash
# Set dummy credentials for local testing
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy
export AWS_REGION=us-east-1
```

### Debugging Steps

1. **Check Prerequisites**

   ```bash
   docker --version
   node --version
   yarn --version
   aws --version
   ```

2. **Test Each Step Individually**

   ```bash
   yarn build
   yarn ci:test-dynamodb
   yarn ci:test-docker
   ```

3. **Check Container Logs**

   ```bash
   docker logs <container-name>
   ```

4. **Verify Network Connectivity**
   ```bash
   curl http://localhost:8000/
   curl http://localhost:3000/health
   ```

## CI Pipeline Components

### Job 1: Code Quality

- TypeScript type checking
- ESLint linting
- Prettier formatting
- Security audit

### Job 2: Build and Test

- Dependency installation
- Application build
- DynamoDB setup
- Test execution

### Job 3: Docker

- Docker image build
- Container startup test
- Health check verification
- API functionality test

### Job 4-6: Additional Tests

- Dependency security check
- Performance testing
- Integration testing

## Performance Tips

1. **Use Docker BuildKit**

   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Parallel Testing**

   ```bash
   # Run multiple tests in parallel
   yarn ci:quality-check & yarn ci:test-dynamodb & wait
   ```

3. **Cache Dependencies**
   ```bash
   # Use yarn cache
   yarn install --frozen-lockfile --prefer-offline
   ```

## Environment Variables

Create `.env.test` file:

```env
NODE_ENV=test
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
PORT=3000
```

## Success Criteria

✅ All code quality checks pass
✅ Application builds successfully
✅ DynamoDB Local starts and tables are created
✅ Docker image builds without errors
✅ Container starts and serves requests
✅ Health endpoint responds correctly
✅ API endpoints work as expected

When all these pass locally, your CI pipeline should work on GitHub Actions!
