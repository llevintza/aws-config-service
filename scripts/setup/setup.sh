#!/bin/bash

echo "🚀 Setting up AWS Config Service..."
echo ""

# Check prerequisites first
echo "🔍 Checking prerequisites..."
if command -v node &> /dev/null && command -v yarn &> /dev/null; then
    echo "✅ Node.js and Yarn found"
else
    echo "❌ Missing prerequisites. Please run:"
    echo "   yarn check-prerequisites"
    echo "   # or see docs/CONTRIBUTOR_SETUP.md for complete setup"
    exit 1
fi

echo "📦 Installing dependencies..."
yarn install

echo "🔨 Building the project..."
yarn build

echo "✅ Setup complete!"
echo ""
echo "💡 Next steps:"
echo "   yarn check-prerequisites  # Verify all tools for CI testing"
echo "   yarn dev                  # Start development server"
echo "   yarn ci:test-local        # Test CI pipeline locally (requires Docker, AWS CLI)"
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
echo "📚 Documentation:"
echo "   docs/CONTRIBUTOR_SETUP.md   # Complete setup guide"
echo "   docs/SERVICE_MANAGEMENT.md  # Service management"
echo "   docs/LOCAL_CI_TESTING.md    # CI testing guide"
echo ""
echo "📚 Once running, visit:"
echo "   http://localhost:3000 - Root (redirects to Swagger)"
echo "   http://localhost:3000/docs - Swagger UI documentation"
echo "   http://localhost:3000/health - Health check"
echo "   http://localhost:3000/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit - Example config"
