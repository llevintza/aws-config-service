# aws-config-service

A simple but optimized REST API service that loads configurations for tenant, environment, cloud, service. Built with Node.js, TypeScript, Fastify, and Docker with Swagger integration.

## Features

- 🚀 **Fastify** - High-performance web framework
- 📝 **TypeScript** - Type-safe development
- 🐳 **Docker** - Containerized deployment
- 📚 **Swagger** - API documentation and testing
- 🔄 **Hot Reload** - Development mode with automatic restarts
- ⚡ **Yarn** - Fast and reliable package management
- 🎯 **Husky** - Git hooks for code quality
- ✨ **ESLint** - Code linting and quality checks
- 💅 **Prettier** - Automatic code formatting
- 📋 **Commitlint** - Conventional commit message enforcement

## API Endpoints

### Configuration Endpoint

```
GET /config/{tenant}/cloud/{cloudRegion}/service/{service}/config/{configName}
```

Example:

```
GET /config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit
```

### Additional Endpoints

- `GET /health` - Health check
- `GET /config` - List all configurations
- `GET /docs` - Swagger UI documentation

## Quick Start

### Prerequisites

- **Node.js 22+** - For runtime compatibility with CI/CD environment
- **Yarn** - Package manager
- **Docker** - For containerization and local testing
- **AWS CLI v2** - For DynamoDB Local integration and CI testing

📋 **For detailed setup instructions, see [CONTRIBUTOR_SETUP.md](./docs/CONTRIBUTOR_SETUP.md)**

### Local Development

**📋 For detailed service management instructions, see [SERVICE_MANAGEMENT.md](./docs/SERVICE_MANAGEMENT.md)**

1. **Run the setup script** (recommended):

   ```bash
   ./scripts/setup/setup.sh
   ```

2. **Run in development mode (with hot reload):**

   ```bash
   yarn dev
   ```

3. **Run in development mode (with TypeScript watch and auto-restart):**

   ```bash
   yarn dev:watch
   ```

4. **Run in production mode:**

   ```bash
   yarn build
   yarn start
   ```

5. **Run with development build:**
   ```bash
   yarn start:dev
   ```

### 🐛 Debugging

**📋 For detailed debugging instructions, see [DEBUGGING.md](./docs/DEBUGGING.md)**

The project is fully configured for debugging with VS Code. You have several debugging options:

#### Debug Scripts:

- `yarn debug` - Debug TypeScript files directly with hot reload
- `yarn debug:brk` - Debug with breakpoint on first line (waits for debugger)
- `yarn debug:compiled` - Debug compiled JavaScript (faster startup)
- `yarn debug:compiled:brk` - Debug compiled JS with initial breakpoint

#### VS Code Debug Configurations:

1. **Debug TypeScript App** - Debug TypeScript files directly
2. **Debug Compiled JS** - Debug compiled JavaScript (with automatic build)
3. **Attach to Running Process** - Attach to already running debug process
4. **Debug with ts-node-dev** - Debug using ts-node-dev with hot reload

#### How to Debug:

1. **Set breakpoints** in your TypeScript files by clicking on the line numbers
2. **Press F5** or go to Run & Debug panel and select a debug configuration
3. **Use the debug console** to evaluate expressions and inspect variables
4. **Step through code** using F10 (step over), F11 (step into), and F12 (step out)

#### Debug Tips:

- Source maps are enabled, so you can debug TypeScript files directly
- Use `debugger;` statement in your code for programmatic breakpoints
- The debugger will automatically restart when files change (with hot reload configs)
- Check the Debug Console for output and use it to evaluate expressions

### 🧪 Testing & CI

**📋 For complete testing setup, see [scripts/README.md](./scripts/README.md)**

The project includes organized scripts for various testing scenarios:

#### Testing DynamoDB Connectivity:

```bash
# Test DynamoDB Local setup
./scripts/dynamodb/test-dynamodb.sh

# Use Docker Compose for full environment testing
docker-compose -f docker-compose.dynamodb-test.yml up
```

#### Testing CI Jobs Locally:

```bash
# Test the complete Docker CI job locally
./scripts/ci/test-docker-locally.sh

# Test using GitHub Actions local runner
./scripts/ci/test-with-act.sh
```

#### General Application Testing:

```bash
# Test application health endpoints
./scripts/testing/test-health.sh

# Run minimal functionality tests
./scripts/testing/test-minimal.sh
```

**Stopping the service:**

```bash
# Graceful shutdown (recommended)
Ctrl+C  # if running in foreground
yarn stop  # if running in background

# Check service status
yarn status
```

### Docker

1. **Build and run with Docker Compose:**

   ```bash
   yarn docker:up
   ```

2. **Build Docker image manually:**

   ```bash
   yarn docker:build
   ```

3. **Run Docker container:**
   ```bash
   yarn docker:run
   ```

## Access the Service

Once running, you can access:

- **Root URL**: http://localhost:3000 (redirects to Swagger UI)
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health
- **Example Config**: http://localhost:3000/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit

## Configuration Data

The service reads configuration data from `data/configurations.json`. The structure supports:

- Multiple tenants
- Multiple cloud regions per tenant
- Multiple services per region
- Multiple configurations per service

Example response:

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

## Project Structure

```
aws-config-service/
├── .github/                   # GitHub workflows and templates
│   ├── workflows/
│   │   ├── ci.yml            # Main CI pipeline
│   │   └── pr-checks.yml     # Pull request validation
│   └── pull_request_template/
├── .vscode/                   # VS Code configuration
│   ├── launch.json           # Debug configurations
│   ├── settings.json         # Workspace settings
│   └── tasks.json            # Build and run tasks
├── src/                       # Source code
│   ├── server.ts             # Main server entry point
│   ├── __tests__/            # Test files
│   │   ├── configService.test.ts
│   │   └── integration/
│   ├── config/               # Configuration modules
│   │   ├── dynamodb.ts       # DynamoDB configuration
│   │   ├── logger.ts         # Logging configuration
│   │   └── pino-winston-bridge.ts
│   ├── container/            # Dependency injection
│   │   └── DIContainer.ts    # IoC container setup
│   ├── factories/            # Service factories
│   │   └── ConfigServiceFactory.ts
│   ├── interfaces/           # TypeScript interfaces
│   │   └── IConfigService.ts
│   ├── plugins/              # Fastify plugins
│   │   ├── request-logging.ts
│   │   ├── swagger.ts        # API documentation
│   │   ├── swagger-ui.ts     # Swagger UI setup
│   │   └── swagger-combined.ts
│   ├── routes/               # API route handlers
│   │   ├── index.ts          # Route registration
│   │   ├── config.ts         # Configuration endpoints
│   │   └── health.ts         # Health check endpoints
│   ├── schemas/              # JSON schemas
│   │   ├── config.json       # Configuration schema
│   │   └── health.json       # Health check schema
│   ├── services/             # Business logic services
│   │   ├── configService.ts  # Abstract base service
│   │   ├── fileConfigService.ts    # File-based implementation
│   │   ├── dynamoConfigService.ts  # DynamoDB implementation
│   │   └── hybridConfigService.ts  # Hybrid implementation
│   ├── testing/              # Testing utilities
│   │   ├── jest.setup.ts     # Jest configuration
│   │   └── MockConfigService.ts    # Mock implementations
│   └── types/                # TypeScript type definitions
│       └── config.ts         # Configuration types
├── data/                     # Static data files
│   └── configurations.json  # Default configuration data
├── docs/                     # Documentation
│   ├── CONTRIBUTOR_SETUP.md  # Development setup guide
│   ├── DEBUGGING.md          # Debugging instructions
│   ├── DESIGN_PATTERNS.md    # Architecture documentation
│   ├── DYNAMODB_SETUP.md     # DynamoDB configuration guide
│   ├── ESLINT_FIX_SUMMARY.md # Code quality documentation
│   └── SERVICE_MANAGEMENT.md # Operations guide
├── logs/                     # Application logs (gitignored)
├── scripts/                  # Development and deployment scripts
│   ├── ci/                   # CI/CD testing scripts
│   │   ├── test-docker-locally.sh   # Local Docker CI testing
│   │   ├── test-with-act.sh         # GitHub Actions local testing
│   │   ├── test-ci-locally.sh       # General CI testing
│   │   └── test-docker-build.sh     # Docker build testing
│   ├── dynamodb/             # DynamoDB management
│   │   ├── create-dynamodb-table.sh # Table creation script
│   │   └── test-dynamodb.sh         # DynamoDB connectivity test
│   ├── setup/                # Environment setup
│   │   ├── setup.sh          # Main setup script
│   │   ├── install-prerequisites.sh # Dependencies installation
│   │   └── check-prerequisites.sh   # Prerequisites validation
│   ├── testing/              # General testing scripts
│   │   ├── test-health.sh    # Health endpoint testing
│   │   ├── test-minimal.sh   # Minimal functionality tests
│   │   └── test-simple.sh    # Simple application tests
│   ├── create-table.ts       # TypeScript table creation
│   ├── migrate-to-dynamodb.ts # Data migration script
│   └── README.md             # Scripts documentation
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.dev.json        # Development TypeScript config
├── jest.config.js           # Jest testing configuration
├── jest.integration.config.js # Integration test configuration
├── jest.setup.ts            # Jest setup file
├── eslint.config.js         # ESLint configuration
├── commitlint.config.js     # Commit message linting
├── nodemon.json             # Development auto-reload config
├── healthcheck.js           # Docker health check script
├── Dockerfile               # Container image definition
├── docker-compose.yml       # Development environment
├── docker-compose.dynamodb.yml     # DynamoDB standalone setup
├── docker-compose.dynamodb-test.yml # DynamoDB testing environment
├── docker-compose.ci-test.yml      # CI testing environment
├── CI_CD_SETUP.md          # CI/CD documentation
└── MIGRATION_SUMMARY.md    # Migration documentation
```

## Available Scripts

### Development

- `yarn dev` - Development mode with hot reload
- `yarn dev:watch` - TypeScript watch mode with auto-restart
- `yarn build` - Build TypeScript to JavaScript
- `yarn build:watch` - Build TypeScript in watch mode
- `yarn start` - Start the compiled application
- `yarn start:dev` - Build and start (useful for testing production build locally)

### Service Management

- `yarn stop` - Gracefully stop the running service
- `yarn stop:force` - Force stop the service (if graceful stop fails)
- `yarn restart` - Restart the service
- `yarn restart:dev` - Restart in development mode
- `yarn status` - Check if service is running
- `yarn port:check` - Check what's using port 3000
- `yarn port:free` - Free up port 3000

### Code Quality

- `yarn format` - Format code with Prettier
- `yarn format:check` - Check if code is properly formatted
- `yarn type-check` - Run TypeScript type checking
- `yarn pre-commit` - Run pre-commit checks manually
- `yarn lint` - Lint TypeScript files
- `yarn lint:fix` - Fix linting issues

### Prerequisites & Setup

- `yarn check-prerequisites` - Verify all required tools are installed
- 📋 **For setup help, see [CONTRIBUTOR_SETUP.md](./docs/CONTRIBUTOR_SETUP.md)**

### Docker

- `yarn docker:build` - Build Docker image
- `yarn docker:run` - Run Docker container
- `yarn docker:up` - Build and run with Docker Compose
- `yarn docker:down` - Stop Docker Compose services
- `yarn docker:stop` - Stop Docker services without removing
- `yarn docker:restart` - Restart Docker services

### CI Testing (requires prerequisites)

#### 🎯 Recommended Testing Commands

- `yarn test:comprehensive-ci` - **Complete validation of all GitHub Actions fixes**
- `yarn test:security-scan` - Test Trivy vulnerability scanning
- `yarn test:dynamodb-connectivity` - Test DynamoDB connectivity fix
- `yarn verify:github-actions-fix` - Verify specific GitHub Actions fixes

#### 🔧 Legacy/Individual Testing

- `yarn ci:test-local` - Run complete CI pipeline simulation
- `yarn ci:test-docker` - Test Docker builds only
- `yarn ci:test-dynamodb` - Test DynamoDB Local only
- `yarn ci:test-compose` - Test Docker Compose setup
- `yarn ci:quality-check` - Run code quality checks only

#### 📋 Documentation

- **For all testing commands**: [TESTING_COMMANDS.md](./docs/TESTING_COMMANDS.md)
- **GitHub Actions fixes**: [SECURITY_SCANNING_FIX.md](./docs/SECURITY_SCANNING_FIX.md)
- **CI testing setup**: [LOCAL_CI_TESTING.md](./docs/LOCAL_CI_TESTING.md)
