# AWS Config Service

> 🚀 A high-performance REST API service for managing tenant-specific configurations across cloud environments and services.

## 📊 Project Status

![Build Status](../../actions/workflows/ci.yml/badge.svg)
![Security Scan](../../actions/workflows/security.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 What This Service Does

Think of this service as a **centralized configuration management hub** for multi-tenant cloud applications. Just like how a master control panel manages settings for different buildings in a complex, this service manages configurations for different tenants, cloud regions, and services through a simple, well-documented REST API.

### Why It Matters

In modern cloud environments, managing configurations across multiple tenants and regions can become chaotic. This service brings order by:
- **Centralizing** all configuration data in one place
- **Organizing** configurations by tenant, region, and service
- **Providing** fast, reliable access through a REST API
- **Ensuring** consistency across your entire infrastructure

## ✨ Key Features

- **🚀 High Performance** - Built with Fastify for optimal throughput
- **🏢 Multi-Tenant Support** - Isolated configurations per tenant
- **☁️ Cloud-Native Design** - Docker-ready with health monitoring
- **📚 Self-Documenting** - Interactive Swagger UI for API exploration
- **🔧 Developer-Friendly** - Hot reload, debugging, and comprehensive tooling
- **🛡️ Production-Ready** - Health checks, logging, and monitoring built-in

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js 22+** (the JavaScript runtime)
- **Yarn** (package manager - faster than npm)
- **Docker** (for containerization - optional but recommended)

### Get Running in 3 Steps

1. **Clone and setup the project:**
   ```bash
   git clone https://github.com/llevintza/aws-config-service.git
   cd aws-config-service
   ./scripts/setup/setup.sh  # Automated setup script
   ```

2. **Start development mode:**
   ```bash
   yarn dev  # Starts with hot reload
   ```

3. **Explore the API:**
   - **Interactive Documentation**: http://localhost:3000/docs
   - **Health Check**: http://localhost:3000/health
   - **Sample API Call**: http://localhost:3000/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit

## 🏗️ Architecture at a Glance

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│  Config Service  │───▶│  Configuration  │
│   (Fastify)     │    │   (Business)     │    │     Store       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   • Request Routing      • Data Validation        • File System
   • Input Validation     • Business Logic         • DynamoDB
   • API Documentation    • Response Formatting    • Hybrid Mode
```

**Think of it as three layers working together:**
- **Front Door (API Layer)**: Handles incoming requests and validates them
- **Brain (Service Layer)**: Processes business logic and data transformation
- **Storage (Data Layer)**: Flexible backends (files, DynamoDB, or both)

## 🛠️ Development Setup

### For First-Time Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/aws-config-service.git
   cd aws-config-service
   ```

3. **Run the automated setup:**
   ```bash
   ./scripts/setup/setup.sh
   ```
   This script will:
   - Check all prerequisites
   - Install dependencies
   - Set up development environment
   - Run initial tests

4. **Start developing:**
   ```bash
   yarn dev        # Development with hot reload
   yarn test       # Run tests
   yarn build      # Production build
   ```

### Code Quality Tools

We maintain high code quality with automated tools:
- **TypeScript** for type safety
- **ESLint** for code standards
- **Prettier** for consistent formatting
- **Jest** for testing
- **Husky** for pre-commit hooks

## 🧭 Project Navigation

### Core Directories
```
aws-config-service/
├── src/                    # Main source code
│   ├── routes/            # API endpoint definitions
│   ├── services/          # Business logic layer
│   ├── config/            # Configuration management
│   └── types/             # TypeScript type definitions
├── data/                  # Sample configuration data
├── docs/                  # Detailed documentation
├── scripts/               # Development & deployment utilities
└── __tests__/             # Test suites
```

### Essential Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `docker-compose.yml` - Local development with Docker
- `jest.config.js` - Testing configuration

## 📚 Documentation Hub

### 🚀 Getting Started
- **[Contributor Setup](../docs/CONTRIBUTOR_SETUP.md)** - Complete setup guide for new contributors
- **[Development Workflow](../docs/SERVICE_MANAGEMENT.md)** - Day-to-day development practices

### 🏗️ Architecture & Design
- **[System Architecture](../docs/DESIGN_PATTERNS.md)** - Design decisions and architectural patterns

### 🛠️ Development
- **[Testing Guide](../docs/TESTING_COMMANDS.md)** - Comprehensive testing strategies
- **[Debugging](../docs/DEBUGGING.md)** - Debug configurations and troubleshooting
- **[Docker Guide](../docs/DOCKER_GUIDE.md)** - Container development and deployment
- **[Scripts Reference](../docs/SCRIPTS_REFERENCE.md)** - All available commands and utilities

### 🚀 DevOps & Deployment
- **[CI/CD Pipeline](../docs/CI_CD_PIPELINE.md)** - Automated workflows and deployment
- **[Database Setup](../docs/DYNAMODB_SETUP.md)** - DynamoDB configuration and management
- **[Security Guidelines](../docs/SECURITY_SCANNING_FIX.md)** - Security practices and tools

## 🤝 Contributing

We welcome contributions from developers of all experience levels! Here's how to get involved:

### 🎯 Ways to Contribute
- **Bug Reports**: Found something broken? Open an issue!
- **Feature Requests**: Have an idea? We'd love to hear it!
- **Code Contributions**: Fix bugs, add features, improve documentation
- **Documentation**: Help make our docs even better

### 🚀 Contribution Process
1. **Read the [Contributor Setup Guide](../docs/CONTRIBUTOR_SETUP.md)**
2. **Fork the repository and create a feature branch**
3. **Make your changes with tests**
4. **Submit a pull request with a clear description**

### 📋 Before You Submit
- ✅ All tests pass (`yarn test`)
- ✅ Code follows our style guide (`yarn lint`)
- ✅ Documentation is updated if needed
- ✅ Commit messages are clear and descriptive

## 🆘 Need Help?

### 💬 Getting Support
- **📖 Documentation**: Start with the `../docs/` folder for detailed guides
- **🐛 Issues**: [Create a GitHub issue](../../issues) for bugs or questions
- **💡 Discussions**: [Join our discussions](../../discussions) for ideas and help
- **⚡ Quick Status**: Run `yarn status` to check service health

### 🔧 Common Tasks
```bash
# Check if everything is working
yarn status

# Run all quality checks
yarn lint && yarn test && yarn build

# Clean install (if you have issues)
rm -rf node_modules yarn.lock && yarn install

# Docker development
yarn docker:up    # Start all services
yarn docker:down  # Stop all services
```

### Recent Activity
- ✅ **CI/CD Pipeline**: Fully automated testing and deployment
- ✅ **Security Scanning**: Regular vulnerability assessments
- ✅ **Documentation**: Comprehensive guides for all contributors
- 🔄 **Active Development**: Regular updates and improvements

---

**Ready to contribute?** Start with our [Contributor Setup Guide](../docs/CONTRIBUTOR_SETUP.md) and join our growing community of developers! 

*For detailed technical information, architecture decisions, and advanced usage, explore the comprehensive documentation in the [`../docs/`](../docs/) folder.*
