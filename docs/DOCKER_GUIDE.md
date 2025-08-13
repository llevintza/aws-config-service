# Docker Development Guide

This guide provides comprehensive instructions for using Docker with the AWS Config Service, from development to production deployment.

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Development with Docker Compose

```bash
# Start all services (API + DynamoDB)
yarn docker:up

# Start only DynamoDB for development
yarn docker:dynamodb

# Stop all services
yarn docker:down
```

## 🏗️ Docker Architecture

### Service Stack
```
┌─────────────────────┐
│   API Service       │  <- Port 3000
│   (Node.js/Fastify) │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   DynamoDB Local    │  <- Port 8000
│   (Configuration)   │
└─────────────────────┘
```

### Container Configuration

#### Main Application Container
- **Base Image**: `node:22-alpine`
- **Port**: 3000
- **Health Check**: `/health` endpoint
- **Environment**: Production-optimized

#### DynamoDB Local Container
- **Image**: `amazon/dynamodb-local`
- **Port**: 8000
- **Data**: Persisted in Docker volume

## 🛠️ Development Workflows

### Local Development with Hot Reload
```bash
# Option 1: Hybrid (DynamoDB in Docker, API local)
yarn docker:dynamodb        # Start DynamoDB
yarn dev                    # Start API with hot reload

# Option 2: Full Docker (both services)
yarn docker:up              # Both API and DynamoDB in containers
```

### Testing with Docker
```bash
# Test Docker build
yarn docker:build

# Test full stack
yarn docker:up
curl http://localhost:3000/health

# Clean up
yarn docker:down
```

## 📋 Available Docker Commands

### Core Commands
```bash
# Build and Development
yarn docker:build          # Build the application image
yarn docker:run            # Run single container
yarn docker:up             # Start development stack
yarn docker:down           # Stop and remove containers

# Service Management
yarn docker:stop           # Stop containers (keep data)
yarn docker:restart        # Restart all services

# DynamoDB Only
yarn docker:dynamodb       # Start only DynamoDB
yarn docker:dynamodb:down  # Stop DynamoDB container
```

### Advanced Usage
```bash
# Build with specific tag
docker build -t aws-config-service:v1.0.0 .

# Run with custom environment
docker run -p 3000:3000 -e NODE_ENV=production aws-config-service

# Debug inside container
docker exec -it aws-config-service_api_1 sh
```

## 🔧 Configuration

### Environment Variables
```env
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# DynamoDB
DYNAMODB_ENDPOINT=http://dynamodb:8000
DYNAMODB_REGION=us-east-1
DYNAMODB_TABLE_NAME=aws-config-service

# Docker Compose overrides
COMPOSE_PROJECT_NAME=aws-config-service
```

### Docker Compose Files
- `docker-compose.yml` - Full development stack
- `docker-compose.dynamodb.yml` - DynamoDB only
- `docker-compose.ci-test.yml` - CI testing configuration

## 🏭 Production Deployment

### Multi-stage Build
```dockerfile
# Development stage
FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .

# Build stage
FROM development AS build
RUN yarn build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN yarn install --production --frozen-lockfile
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Production Configuration
```bash
# Build production image
docker build --target production -t aws-config-service:prod .

# Run with production settings
docker run -d \
  --name aws-config-service \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  aws-config-service:prod
```

## 🔍 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using port 3000
yarn port:check

# Free the port
yarn port:free

# Or use different port
docker run -p 3001:3000 aws-config-service
```

#### Container Won't Start
```bash
# Check logs
docker logs aws-config-service_api_1

# Check health
docker exec aws-config-service_api_1 curl localhost:3000/health

# Rebuild from scratch
docker system prune -f
yarn docker:build --no-cache
```

#### DynamoDB Connection Issues
```bash
# Verify DynamoDB is running
docker ps | grep dynamodb

# Test connection
docker exec aws-config-service_api_1 \
  curl http://dynamodb:8000

# Check network connectivity
docker network ls
docker network inspect aws-config-service_default
```

### Performance Optimization

#### Image Size Optimization
```dockerfile
# Use alpine images
FROM node:22-alpine

# Multi-stage builds
FROM node:22-alpine AS builder
# ... build steps
FROM node:22-alpine AS runtime

# Remove dev dependencies
RUN npm ci --only=production && npm cache clean --force
```

#### Container Resource Limits
```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## 🚀 CI/CD with Docker

### GitHub Actions Integration
```yaml
# .github/workflows/docker.yml
- name: Build Docker image
  run: docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .

- name: Run security scan
  run: |
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
      aquasec/trivy image ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### Local CI Testing
```bash
# Test the build pipeline locally
./scripts/ci/test-docker-build.sh

# Test with act (GitHub Actions locally)
act push --job docker-build
```

## 📚 Best Practices

### Development
- Use `yarn docker:dynamodb` for hybrid development (fast API restarts)
- Mount source code as volume for live editing in containers
- Use Docker Compose profiles for different environments

### Production
- Always use multi-stage builds to minimize image size
- Set resource limits and health checks
- Use production-optimized base images (alpine, distroless)
- Implement proper logging and monitoring

### Security
- Run containers as non-root user
- Scan images for vulnerabilities
- Use secrets management for sensitive data
- Keep base images updated

## 🔗 Related Documentation

- [Local Development Setup](CONTRIBUTOR_SETUP.md)
- [CI/CD Pipeline](CI_CD_PIPELINE.md)
- [DynamoDB Setup](DYNAMODB_SETUP.md)
- [Security Scanning](SECURITY_SCANNING_FIX.md)
