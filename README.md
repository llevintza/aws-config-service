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

1. **Setup the project:**

   ```bash
   ./setup.sh
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
├── src/
│   ├── server.ts              # Main server file
│   ├── plugins/
│   │   ├── swagger.ts         # Swagger documentation configuration
│   │   └── swagger-ui.ts      # Swagger UI configuration
│   ├── routes/
│   │   ├── index.ts           # Route registration helper
│   │   ├── config.ts          # Configuration routes
│   │   └── health.ts          # Health and system routes
│   ├── services/
│   │   └── configService.ts   # Configuration business logic
│   └── types/
│       └── config.ts          # TypeScript interfaces
├── data/
│   └── configurations.json    # Configuration data
├── docs/
│   ├── CONTRIBUTOR_SETUP.md   # Complete contributor setup guide
│   ├── DEBUGGING.md           # Debugging guide
│   ├── LOCAL_CI_TESTING.md    # Local CI testing guide
│   └── SERVICE_MANAGEMENT.md  # Detailed service management guide
├── package.json
├── tsconfig.json
├── nodemon.json               # Nodemon configuration for hot reload
├── Dockerfile
├── docker-compose.yml
└── setup.sh                   # Setup script
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

- `yarn ci:test-local` - Run complete CI pipeline simulation
- `yarn ci:test-docker` - Test Docker builds only
- `yarn ci:test-dynamodb` - Test DynamoDB Local only
- `yarn ci:test-compose` - Test Docker Compose setup
- `yarn ci:quality-check` - Run code quality checks only
- 📋 **For CI testing setup, see [LOCAL_CI_TESTING.md](./docs/LOCAL_CI_TESTING.md)**
