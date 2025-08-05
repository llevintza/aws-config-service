# Multi-stage build for better optimization
FROM node:22-alpine AS builder

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++

# Install Yarn with specific version
RUN corepack enable && corepack prepare yarn@1.22.19 --activate

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install ALL dependencies (including dev deps for building)
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

# Production stage
FROM node:22-alpine AS production

# Install runtime dependencies that might be needed
RUN apk add --no-cache dumb-init

# Install Yarn with specific version
RUN corepack enable && corepack prepare yarn@1.22.19 --activate

WORKDIR /app

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# Copy package files
COPY package.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY healthcheck.js ./

# Ensure logs directory permissions
RUN chown -R node:node /app/logs && chmod -R 755 /app/logs

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["yarn", "start"]
