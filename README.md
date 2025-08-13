# AWS Config Service

> A high-performance REST API service for managing tenant-specific configurations across cloud environments and services.

## 🎯 Mission Statement

This service provides a centralized, scalable solution for configuration management across multi-tenant cloud environments. It enables teams to manage configurations for different tenants, cloud regions, and services through a simple, well-documented REST API.

## ✨ Key Features

- **🚀 High Performance** - Built with Fastify for optimal throughput
- **🏢 Multi-Tenant** - Support for multiple tenants and environments
- **☁️ Cloud-Native** - Designed for cloud deployment with Docker
- **📚 Self-Documenting** - Integrated Swagger UI for API exploration
- **🔧 Developer-Friendly** - Hot reload, debugging, and comprehensive tooling
- **🛡️ Production-Ready** - Health checks, logging, and monitoring

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+**
- **Yarn** package manager
- **Docker** (for containerization)

### Get Started in 3 Steps

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd aws-config-service
   ./scripts/setup/setup.sh
   ```

2. **Start development:**
   ```bash
   yarn dev
   ```

3. **Explore the API:**
   - Open http://localhost:3000/docs for Swagger UI
   - Try: http://localhost:3000/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit

## 🏗️ API Overview

### Primary Endpoint
```
GET /config/{tenant}/cloud/{cloudRegion}/service/{service}/config/{configName}
```

### Example Response
```json
{
  "tenant": "tenant1",
  "cloudRegion": "us-east-1",
  "service": "api-gateway",
  "configName": "rate-limit",
  "config": {
    "value": 1000,
    "unit": "requests/minute",
    "description": "API Gateway rate limiting configuration"
  },
  "found": true
}
```

### Additional Endpoints
- `GET /health` - Service health status
- `GET /config` - List all configurations
- `GET /docs` - Interactive API documentation

## 🏛️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│  Config Service  │───▶│  Configuration  │
│   (Fastify)     │    │   (Business)     │    │     Store       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   • Routing              • Validation             • File System
   • Validation           • Transformation         • DynamoDB
   • Documentation        • Business Logic         • Hybrid Mode
```

The service follows a clean architecture pattern with clear separation of concerns:
- **API Layer**: Request handling and validation
- **Service Layer**: Business logic and data transformation
- **Data Layer**: Flexible storage backends (file, DynamoDB, or hybrid)

## 🛠️ Development

### Local Development
```bash
# Development with hot reload
yarn dev

# Development with TypeScript watch
yarn dev:watch

# Production build
yarn build && yarn start
```

### Testing
```bash
# Run all tests
yarn test

# Run with coverage
yarn test:coverage

# Integration tests
yarn test:integration
```

### Docker Development
```bash
# Build and run with Docker Compose
yarn docker:up

# Stop services
yarn docker:down
```

## 📊 Project Structure

```
aws-config-service/
├── src/                    # Source code
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── config/            # Configuration management
│   └── types/             # TypeScript definitions
├── data/                  # Configuration data
├── docs/                  # Detailed documentation
├── scripts/               # Development & deployment scripts
└── tests/                 # Test suites
```

## 📚 Documentation

### For Contributors
- **[Getting Started](docs/CONTRIBUTOR_SETUP.md)** - Detailed setup instructions
- **[Development Guide](docs/SERVICE_MANAGEMENT.md)** - Running and managing the service
- **[Debugging](docs/DEBUGGING.md)** - Debug configurations and troubleshooting
- **[Testing](docs/TESTING_COMMANDS.md)** - Comprehensive testing guide

### For Architects & DevOps
- **[Design Patterns](docs/DESIGN_PATTERNS.md)** - Architecture decisions and patterns
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Detailed codebase organization
- **[Database Setup](docs/DYNAMODB_SETUP.md)** - DynamoDB configuration
- **[CI/CD](docs/LOCAL_CI_TESTING.md)** - Continuous integration setup
- **[Security](docs/SECURITY_SCANNING_FIX.md)** - Security scanning and fixes

### For Operations
- **[Docker Guide](docs/DOCKER_GUIDE.md)** - Container deployment and management
- **[Scripts Reference](docs/SCRIPTS_REFERENCE.md)** - All available commands and scripts
- **[Dependency Management](docs/DEPENDENCY_MANAGEMENT.md)** - Managing project dependencies
- **[Troubleshooting](docs/YARN_INSTALL_FIX.md)** - Common issues and solutions

## 🤝 Contributing

We welcome contributions! Please check our [Contributor Setup Guide](docs/CONTRIBUTOR_SETUP.md) for detailed instructions on:
- Setting up your development environment
- Code quality standards and tools
- Testing requirements
- Submission guidelines

## 📝 License

[Add your license information here]

## 🆘 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentation**: Check the `docs/` folder for detailed guides
- **Quick Help**: Use `yarn status` to check service health

---

*For detailed technical information, architecture decisions, and advanced usage, please refer to the documentation in the `docs/` folder.*
