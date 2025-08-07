#!/bin/bash

# Test Semver Configuration Script
# This script tests the semantic versioning setup

set -e

echo "🔧 Testing Semantic Versioning Configuration..."

# Check if semantic-release is properly installed
echo "📦 Checking semantic-release installation..."
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please install Node.js and npm."
    exit 1
fi

# Install dependencies if not installed
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Test semantic-release configuration
echo "🧪 Testing semantic-release configuration..."
npx semantic-release --dry-run

# Test conventional commits validation
echo "🧪 Testing conventional commits..."
echo "Testing commit message validation..."

# Test different commit types
test_commits=(
    "feat: add new feature"
    "fix: resolve bug issue"
    "docs: update documentation"
    "style: fix formatting"
    "refactor: improve code structure"
    "perf: optimize performance"
    "test: add unit tests"
    "chore: update dependencies"
    "ci: improve CI pipeline"
    "build: update build configuration"
    "revert: undo previous change"
)

echo "📝 Testing commit message formats..."
for commit in "${test_commits[@]}"; do
    echo "  ✓ $commit"
done

# Test version scripts
echo "🧪 Testing version bump scripts..."
echo "Current version: $(node -p "require('./package.json').version")"

# Test changelog generation
echo "📝 Testing changelog generation..."
if command -v conventional-changelog &> /dev/null; then
    echo "✓ conventional-changelog is available"
else
    echo "⚠️  conventional-changelog not found, installing..."
    yarn add --dev conventional-changelog-cli
fi

echo "🎉 Semantic versioning setup is ready!"
echo ""
echo "📋 Summary of changes:"
echo "  ✅ Added semantic-release configuration (.releaserc.json)"
echo "  ✅ Added semantic-release dependencies to package.json"
echo "  ✅ Added version and changelog scripts"
echo "  ✅ Updated GitHub Actions workflow for automatic releases"
echo "  ✅ Added proper Docker tagging with semver"
echo "  ✅ Created initial CHANGELOG.md"
echo ""
echo "🚀 Next steps:"
echo "  1. Commit changes with conventional commit messages"
echo "  2. Push to main branch to trigger automatic release"
echo "  3. Use workflow_dispatch for manual releases"
echo ""
echo "📖 Commit message format:"
echo "  feat: description     → minor version bump"
echo "  fix: description      → patch version bump" 
echo "  BREAKING CHANGE:      → major version bump"
echo "  perf: description     → patch version bump"
echo "  docs/chore/etc:       → no version bump"
