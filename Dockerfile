FROM node:18-alpine

# Install Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source code and build
COPY . .
RUN yarn build

# Ensure logs directory permissions after copying files
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
