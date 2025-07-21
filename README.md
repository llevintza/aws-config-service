# aws-config-service

A simple but optimized REST API service that loads configurations for tenant, environment, cloud, service. Built with Node.js, TypeScript, Fastify, and Docker with Swagger integration.

## Features

- 🚀 **Fastify** - High-performance web framework
- 📝 **TypeScript** - Type-safe development
- 🐳 **Docker** - Containerized deployment
- 📚 **Swagger** - API documentation and testing
- 🔄 **Hot Reload** - Development mode with automatic restarts
- ⚡ **Yarn** - Fast and reliable package management

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
- Node.js 18+
- Yarn package manager

### Local Development

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
├── package.json
├── tsconfig.json
├── nodemon.json               # Nodemon configuration for hot reload
├── Dockerfile
├── docker-compose.yml
└── setup.sh                   # Setup script
```

## Available Scripts

- `yarn dev` - Development mode with hot reload
- `yarn dev:watch` - TypeScript watch mode with auto-restart
- `yarn build` - Build TypeScript to JavaScript
- `yarn build:watch` - Build TypeScript in watch mode
- `yarn start` - Start the compiled application
- `yarn start:dev` - Build and start (useful for testing production build locally)
- `yarn lint` - Lint TypeScript files
- `yarn lint:fix` - Fix linting issues
- `yarn docker:build` - Build Docker image
- `yarn docker:run` - Run Docker container
- `yarn docker:up` - Build and run with Docker Compose
- `yarn docker:down` - Stop Docker Compose services 
