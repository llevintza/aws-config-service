# Scripts Directory

This directory contains organized scripts for various development and testing tasks.

## Directory Structure

### 📁 `/ci` - CI/CD Testing Scripts

Scripts for testing GitHub Actions workflows locally before pushing to CI.

- **`test-docker-locally.sh`** - Complete test that simulates the Docker CI job step-by-step
- **`test-with-act.sh`** - Tests GitHub Actions workflow using the `act` tool
- **`test-ci-locally.sh`** - General CI testing script
- **`test-docker-build.sh`** - Docker build testing script

**Usage:**

```bash
# Test the Docker CI job locally
./scripts/ci/test-docker-locally.sh

# Test with GitHub Actions local runner
./scripts/ci/test-with-act.sh
```

### 📁 `/dynamodb` - DynamoDB Management Scripts

Scripts for managing DynamoDB Local instances and table operations.

- **`create-dynamodb-table.sh`** - Creates required DynamoDB tables
- **`test-dynamodb.sh`** - Tests DynamoDB Local connectivity and functionality

**Usage:**

```bash
# Create DynamoDB tables
./scripts/dynamodb/create-dynamodb-table.sh

# Test DynamoDB connectivity
./scripts/dynamodb/test-dynamodb.sh
```

### 📁 `/setup` - Environment Setup Scripts

Scripts for setting up the development environment and dependencies.

- **`setup.sh`** - Main project setup script
- **`install-prerequisites.sh`** - Installs required system dependencies
- **`check-prerequisites.sh`** - Checks if prerequisites are installed

**Usage:**

```bash
# Initial project setup
./scripts/setup/setup.sh

# Install prerequisites
./scripts/setup/install-prerequisites.sh
```

### 📁 `/testing` - General Testing Scripts

Scripts for testing various application components and functionality.

- **`test-health.sh`** - Tests application health endpoints
- **`test-minimal.sh`** - Minimal functionality tests
- **`test-simple.sh`** - Simple application tests

**Usage:**

```bash
# Test application health
./scripts/testing/test-health.sh

# Run minimal tests
./scripts/testing/test-minimal.sh
```

## Quick Reference

### Testing DynamoDB Connectivity

```bash
# Start DynamoDB and test connectivity
docker-compose -f docker-compose.dynamodb-test.yml up

# Or use the testing script
./scripts/dynamodb/test-dynamodb.sh
```

### Testing CI Jobs Locally

```bash
# Test the complete Docker job pipeline
./scripts/ci/test-docker-locally.sh

# Test using GitHub Actions local runner
./scripts/ci/test-with-act.sh
```

### Project Setup

```bash
# Complete project setup
./scripts/setup/setup.sh
```

## Notes

- All scripts are executable (`chmod +x`)
- Scripts use `set -e` to exit on errors
- Most scripts include cleanup functions for Docker containers
- Environment variables are documented within each script
