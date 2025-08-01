# Multi-stage build for better optimization
FROM node:18-alpine AS builder

# Install Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install ALL dependencies (including dev deps for building)
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN yarn build

# Production stage
FROM node:18-alpine AS production

# Install Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

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

# Start the application
CMD ["yarn", "start"]
