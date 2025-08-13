# Scripts Reference Guide

This guide provides a comprehensive reference for all scripts available in the AWS Config Service project, organized by category and use case.

## 📁 Script Organization

```
scripts/
├── setup/              # Environment setup and prerequisites
├── ci/                 # Continuous integration and testing
├── dynamodb/          # DynamoDB management
├── testing/           # Specialized testing scripts
└── *.ts               # TypeScript utility scripts
```

## 🚀 Setup Scripts

### Environment Setup
```bash
# Complete project setup (recommended for new contributors)
./scripts/setup/setup.sh

# Check if all prerequisites are installed
./scripts/setup/check-prerequisites.sh

# Install missing prerequisites automatically
./scripts/setup/install-prerequisites.sh
```

**What these scripts do:**
- Verify Node.js, Yarn, Docker installations
- Install project dependencies
- Set up development environment
- Run initial tests to ensure everything works

## 🏗️ Development Scripts (Package.json)

### Core Development
```bash
# Development with hot reload
yarn dev                    # Start with ts-node-dev
yarn dev:watch             # TypeScript watch + nodemon

# Building and Starting
yarn build                  # Compile TypeScript to JavaScript
yarn start                  # Run compiled JavaScript
yarn start:dev             # Build then start (one-time)
```

### Debugging
```bash
# Debug modes (for VS Code or other debuggers)
yarn debug                  # Debug with inspector on port 9229
yarn debug:brk             # Debug with breakpoint at start
yarn debug:compiled        # Debug compiled JavaScript
yarn debug:compiled:brk    # Debug compiled with breakpoint
```

### Process Management
```bash
# Service control
yarn stop                   # Gracefully stop the server
yarn stop:force           # Force kill the server
yarn restart              # Stop and restart
yarn restart:dev          # Stop and restart in dev mode
yarn status                # Check if server is running
yarn port:check           # Check what's using port 3000
yarn port:free             # Free port 3000
```

## 🧪 Testing Scripts

### Yarn Test Commands
```bash
# Core testing
yarn test                   # Run all tests
yarn test:watch           # Run tests in watch mode
yarn test:coverage        # Run with coverage report
yarn test:integration     # Run integration tests only
```

### CI Testing Scripts
```bash
# Local CI simulation
yarn ci:test-local         # Simulate full CI pipeline locally
./scripts/ci/test-ci-locally.sh

# Component testing
./scripts/ci/test-docker-build.sh      # Test Docker build process
./scripts/ci/test-docker-locally.sh    # Test Docker deployment
./scripts/ci/test-with-act.sh          # Test GitHub Actions with act
./scripts/ci/robust-yarn-install.sh    # Test dependency installation
```

### Specialized Testing Scripts
```bash
# Service testing
./scripts/testing/test-health.sh                    # Test health endpoints
./scripts/testing/test-fastify-ecosystem.sh         # Test Fastify integration
./scripts/testing/test-minimal.sh                   # Minimal smoke test

# Infrastructure testing
./scripts/testing/test-dynamodb-connectivity.sh     # Test DynamoDB connection
./scripts/testing/test-docker-job-locally.sh        # Test Docker jobs
./scripts/testing/test-trivy-security-scan.sh       # Test security scanning

# CI/CD testing
./scripts/testing/test-workflow-improvements.sh     # Test workflow changes
./scripts/testing/test-comprehensive-ci-fixes.sh    # Test CI fixes
./scripts/testing/verify-github-actions-fix.sh      # Verify GitHub Actions
```

## 🗄️ Database Scripts

### DynamoDB Management
```bash
# Local DynamoDB
yarn docker:dynamodb       # Start DynamoDB in Docker
yarn docker:dynamodb:down  # Stop DynamoDB container

# Table operations
yarn dynamodb:create-table # Create configuration table
yarn dynamodb:migrate      # Migrate data to DynamoDB

# Testing
yarn ci:test-dynamodb      # Test DynamoDB integration
./scripts/dynamodb/test-dynamodb.sh
./scripts/dynamodb/create-dynamodb-table.sh
```

## 🐳 Docker Scripts

### Container Management
```bash
# Development
yarn docker:build          # Build application image
yarn docker:run            # Run single container
yarn docker:up             # Start development stack
yarn docker:down           # Stop and remove containers

# Service control
yarn docker:stop           # Stop containers (keep data)
yarn docker:restart        # Restart all services
```

## 🔧 Code Quality Scripts

### Linting and Formatting
```bash
# ESLint
yarn lint                   # Check for linting errors
yarn lint:fix              # Fix auto-fixable linting errors
yarn lint:check            # Check with zero tolerance (CI mode)

# Prettier
yarn format                 # Format all code
yarn format:check          # Check if code is formatted
yarn format:diff           # Show formatting differences

# TypeScript
yarn type-check            # Check TypeScript types without compilation
```

### Git Hooks
```bash
# Pre-commit automation
yarn pre-commit            # Run pre-commit checks manually
# (Automatically runs on git commit via husky)
```

## 🚀 Utility Scripts

### TypeScript Utilities
```bash
# Data management
yarn dynamodb:create-table # Create DynamoDB table (scripts/create-table.ts)
yarn dynamodb:migrate      # Migrate data (scripts/migrate-to-dynamodb.ts)

# Version management
./scripts/test-semver.sh    # Test semantic versioning
```

### Prerequisites Management
```bash
# System checks
yarn check-prerequisites   # Verify all required tools are installed
./scripts/setup/check-prerequisites.sh
```

## 📊 Script Categories by Use Case

### For New Contributors
```bash
./scripts/setup/setup.sh           # One-command setup
yarn dev                           # Start development
yarn test                          # Verify everything works
```

### For Daily Development
```bash
yarn dev                           # Development with hot reload
yarn lint:fix                      # Fix code issues
yarn test:watch                    # Continuous testing
yarn docker:dynamodb              # Local database
```

### For CI/CD and Deployment
```bash
./scripts/ci/test-ci-locally.sh    # Test CI pipeline
yarn ci:test-docker                # Test Docker integration
./scripts/testing/test-health.sh   # Verify service health
```

### For Debugging and Troubleshooting
```bash
yarn debug                         # Debug with inspector
yarn status                        # Check service status
yarn port:check                    # Check port usage
./scripts/testing/test-minimal.sh  # Minimal functionality test
```

## 🔍 Script Details

### Most Important Scripts Explained

#### ./scripts/setup/setup.sh
**Purpose**: Complete project setup for new contributors
**What it does**:
- Checks Node.js, Yarn, Docker versions
- Installs dependencies with retry logic
- Sets up development environment
- Runs initial tests
- Provides troubleshooting tips

#### ./scripts/ci/test-ci-locally.sh
**Purpose**: Simulate the entire CI pipeline locally
**What it does**:
- Runs all quality checks (lint, format, type-check)
- Executes full test suite
- Builds Docker image
- Runs security scans
- Generates reports

#### ./scripts/testing/test-health.sh
**Purpose**: Verify service health and basic functionality
**What it does**:
- Starts the service
- Tests health endpoint
- Verifies API responses
- Checks database connectivity
- Stops the service cleanly

## ⚡ Quick Reference

### One-Liner Commands
```bash
# Complete setup and start
./scripts/setup/setup.sh && yarn dev

# Full quality check
yarn lint:check && yarn format:check && yarn type-check && yarn test

# Clean restart
yarn stop && yarn port:free && yarn dev

# Docker development stack
yarn docker:dynamodb && yarn dev

# CI simulation
./scripts/ci/test-ci-locally.sh
```

### Environment Variables for Scripts
```bash
# Common overrides
NODE_ENV=development    # Set environment
PORT=3001              # Change default port
LOG_LEVEL=debug        # Increase logging
SKIP_TESTS=true        # Skip tests in setup scripts
```

## 🆘 Troubleshooting Scripts

### When Things Go Wrong
```bash
# Port issues
yarn port:check && yarn port:free

# Dependency issues
rm -rf node_modules yarn.lock && yarn install

# Docker issues
docker system prune -f && yarn docker:build

# Full reset
git clean -fdx && ./scripts/setup/setup.sh
```

### Script Debugging
```bash
# Run scripts with debug output
DEBUG=* ./scripts/setup/setup.sh

# Check script permissions
chmod +x scripts/**/*.sh

# Validate shell scripts
shellcheck scripts/**/*.sh
```

## 🔗 Related Documentation

- [Contributor Setup Guide](CONTRIBUTOR_SETUP.md) - Using setup scripts
- [Docker Guide](DOCKER_GUIDE.md) - Docker script details
- [Testing Commands](TESTING_COMMANDS.md) - Test script usage
- [CI/CD Pipeline](CI_CD_PIPELINE.md) - CI script integration
