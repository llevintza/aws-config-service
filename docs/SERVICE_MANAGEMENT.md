# Service Management Guide

This guide explains how to properly start and stop the AWS Config Service both locally and in Docker environments.

## Local Development

### Starting the Service

#### Option 1: Development Mode (Recommended for development)

```bash
yarn dev
```

- ✅ Hot reloading enabled
- ✅ TypeScript compilation on-the-fly
- ✅ Automatic restart on file changes
- ✅ Pretty logging with colors

#### Option 2: Watch Mode (Alternative development mode)

```bash
yarn dev:watch
```

- ✅ TypeScript watch compilation
- ✅ Nodemon for automatic restarts
- ✅ Separate compilation and execution processes

#### Option 3: Production Mode (Local testing)

```bash
yarn build
yarn start
```

- ✅ Optimized compiled JavaScript
- ✅ Production-like environment
- ✅ Best performance

#### Option 4: Build and Start (One command)

```bash
yarn start:dev
```

- ✅ Builds and starts in one command
- ✅ Good for testing production builds locally

### Stopping the Service

The service implements graceful shutdown and responds to standard signals:

#### Recommended: Graceful Shutdown

```bash
# If running in foreground (Ctrl+C)
Ctrl+C

# If running in background, find the process and send SIGTERM
ps aux | grep "node dist/server.js"
kill -TERM <PID>

# Or use yarn to stop (if running via yarn)
# In the terminal where yarn dev is running, press Ctrl+C
```

#### Emergency Stop (if graceful shutdown fails)

```bash
# Kill all Node.js processes (use with caution)
pkill -f "node dist/server.js"

# Or kill by port (if you know the process is using port 3000)
lsof -ti:3000 | xargs kill -9
```

## Docker Environment

### Starting with Docker Compose (Recommended)

```bash
yarn docker:up
```

- ✅ Builds and starts container automatically
- ✅ Handles dependencies and networking
- ✅ Easy to manage with compose commands

### Starting with Docker Commands

```bash
# Build the image
yarn docker:build

# Run the container
yarn docker:run
```

### Stopping Docker Services

#### Graceful Shutdown with Docker Compose

```bash
yarn docker:down
```

- ✅ Sends SIGTERM to containers
- ✅ Waits for graceful shutdown
- ✅ Removes containers and networks

#### Manual Docker Stop

```bash
# List running containers
docker ps

# Stop specific container gracefully
docker stop <container_name_or_id>

# Force stop if needed (not recommended)
docker kill <container_name_or_id>
```

## Port Management

### Check What's Using Port 3000

```bash
# On Linux/macOS
lsof -i :3000
netstat -tulpn | grep :3000

# On Windows (if using WSL)
netstat -ano | findstr :3000
```

### Free Up Port 3000

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -TERM

# If the above doesn't work, force kill
lsof -ti:3000 | xargs kill -9
```

## Troubleshooting

### Service Won't Start

1. **Port already in use**: Check if another service is using port 3000
2. **Dependencies missing**: Run `yarn install`
3. **Build errors**: Run `yarn build` to check for TypeScript errors

### Service Won't Stop Gracefully

1. **Wait**: Give it 10-15 seconds for graceful shutdown
2. **Check logs**: Look for shutdown messages in the console
3. **Force kill**: Use `pkill` or `docker kill` as last resort

### Multiple Processes Running

```bash
# List all Node.js processes
ps aux | grep node

# Kill all aws-config-service processes
pkill -f "aws-config-service"

# Or kill all Node.js processes (nuclear option)
pkill node
```

## Logs and Monitoring

### Development Logs

- Pretty formatted with colors
- Request/response logging
- Error tracking with stack traces

### Production Logs

- Structured JSON format
- Request IDs for tracing
- Performance metrics

### Health Monitoring

- **Health endpoint**: `GET /health`
- **Docker health check**: Automatic container health monitoring
- **Process monitoring**: Graceful shutdown logs

## Best Practices

### Development

1. Always use `yarn dev` for active development
2. Use `Ctrl+C` to stop services gracefully
3. Check port availability before starting
4. Monitor logs for errors and performance

### CI Testing

**Before running CI tests locally, ensure your environment is properly set up:**

📋 **For complete setup instructions, see [CONTRIBUTOR_SETUP.md](./CONTRIBUTOR_SETUP.md)**

#### Required Prerequisites

- Docker (for container testing)
- Node.js 22 (CI environment compatibility)
- Yarn (package manager)
- AWS CLI v2 (DynamoDB Local testing)
- jq (JSON processing)
- build-essential (native module compilation)

#### CI Testing Commands

```bash
# Full CI simulation (requires all prerequisites)
yarn ci:test-local

# Individual CI components
yarn ci:quality-check      # Code quality (no extra prerequisites)
yarn ci:test-docker        # Docker builds (requires Docker)
yarn ci:test-dynamodb      # DynamoDB Local (requires Docker + AWS CLI)
yarn ci:test-compose       # Full compose test (requires Docker)
```

⚠️ **If any CI command fails with "command not found" errors, follow the [CONTRIBUTOR_SETUP.md](./CONTRIBUTOR_SETUP.md) guide.**

### Production

1. Use `yarn build && yarn start` for production
2. Implement process managers (PM2, systemd)
3. Set up proper logging aggregation
4. Monitor health endpoints
5. Use Docker for consistent environments

### Docker

1. Use Docker Compose for multi-service setups
2. Always use `yarn docker:down` to stop services
3. Clean up unused containers regularly: `docker system prune`
4. Monitor container health and resources
