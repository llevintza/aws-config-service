#!/bin/bash

# Test with a simple version without request logging
set -e

echo "🧪 Testing with simplified version..."

# Create a temporary directory for test files
mkdir -p /tmp/simple-test

# Create a simple server without request logging
cat > /tmp/simple-test/simple-server.js << 'EOF'
const fastify = require('fastify')({ logger: true });

// Simple health route without plugins
fastify.get('/health', async (request, reply) => {
  console.log('Health endpoint called');
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Simple test server is running! 🎉',
  };
  console.log('Returning health data:', healthData);
  return healthData;
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server listening on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
EOF

# Create a simple package.json
cat > /tmp/simple-test/package.json << 'EOF'
{
  "name": "simple-test",
  "version": "1.0.0",
  "main": "simple-server.js",
  "dependencies": {
    "fastify": "^4.26.2"
  }
}
EOF

# Create Dockerfile
cat > /tmp/simple-test/Dockerfile << 'EOF'
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "simple-server.js"]
EOF

# Build the simple test image
cd /tmp/simple-test
docker build -t simple-health-test .

# Clean up any existing containers
docker stop simple-health-test 2>/dev/null || true
docker rm simple-health-test 2>/dev/null || true

# Start the simple test container
echo "Starting simple test container..."
docker run -d \
    --name simple-health-test \
    --network host \
    simple-health-test

# Wait for startup
echo "Waiting 3 seconds for startup..."
sleep 3

# Test health endpoint
echo "Testing simple health endpoint..."
timeout 5 curl -f http://localhost:3000/health && echo "SUCCESS!" || echo "FAILED with exit code $?"

echo ""
echo "Simple container logs:"
docker logs simple-health-test

# Cleanup
echo ""
echo "Cleaning up..."
docker stop simple-health-test 2>/dev/null || true
docker rm simple-health-test 2>/dev/null || true
rm -rf /tmp/simple-test
