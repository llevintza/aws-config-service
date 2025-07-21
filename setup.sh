#!/bin/bash

echo "🚀 Setting up AWS Config Service..."

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install yarn first:"
    echo "   npm install -g yarn"
    exit 1
fi

echo "📦 Installing dependencies..."
yarn install

echo "🔨 Building the project..."
yarn build

echo "✅ Setup complete!"
echo ""
echo "🏃 To run the service locally:"
echo "   yarn start:dev  (builds and starts)"
echo "   yarn dev        (development mode with hot reload)"
echo "   yarn dev:watch  (TypeScript watch + auto-restart)"
echo "   yarn start      (production mode, requires build first)"
echo ""
echo "🐳 To run with Docker:"
echo "   yarn docker:up"
echo ""
echo "📚 Once running, visit:"
echo "   http://localhost:3000 - Root (redirects to Swagger)"
echo "   http://localhost:3000/docs - Swagger UI documentation"
echo "   http://localhost:3000/health - Health check"
echo "   http://localhost:3000/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit - Example config"
