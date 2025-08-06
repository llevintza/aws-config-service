# Testing Commands for GitHub Actions Fixes

This document provides a quick reference for all available testing commands to validate the GitHub Actions CI pipeline fixes before pushing to remote.

## Quick Command Reference

```bash
# 🎯 RECOMMENDED: Run comprehensive test covering all fixes
yarn test:comprehensive-ci

# 🔧 Individual component tests
yarn test:dynamodb-connectivity     # Test DynamoDB connectivity fix
yarn test:security-scan            # Test Trivy security scanning
yarn verify:github-actions-fix     # Verify specific GitHub Actions fix
yarn test:yarn-retry               # Test yarn install retry logic

# 🐳 Full workflow simulation tests
yarn ci:test-docker                # Test complete Docker job workflow
yarn ci:test-local                 # Test local CI simulation
yarn ci:test-dynamodb              # Test DynamoDB-specific workflows
```

## Test Categories

### 1. Comprehensive Testing

- **`yarn test:comprehensive-ci`** - Validates all fixes and ensures pipeline readiness

### 2. GitHub Actions Fix Validation

- **`yarn verify:github-actions-fix`** - Tests the specific DynamoDB connectivity fix
- **`yarn test:security-scan`** - Tests Trivy security scanning with permissions

### 3. Component Testing

- **`yarn test:dynamodb-connectivity`** - Isolated DynamoDB connection testing
- **`yarn ci:test-docker`** - Full Docker job workflow simulation

### 4. Legacy/Existing Tests

- **`yarn ci:test-local`** - General CI local testing
- **`yarn ci:test-dynamodb`** - DynamoDB workflow testing

## Recommended Testing Workflow

Before pushing any changes to GitHub:

1. **Quick validation**: `yarn test:comprehensive-ci`
2. **If issues found**: Run specific component tests to debug
3. **Final verification**: `yarn verify:github-actions-fix`

## What Each Test Validates

### `test:comprehensive-ci`

✅ GitHub Actions workflow permissions  
✅ Required testing scripts existence  
✅ Package.json script references  
✅ Docker image builds  
✅ DynamoDB connectivity  
✅ Security scanning capability  
✅ CI workflow structure  
✅ Documentation completeness

### `test:security-scan`

✅ Trivy installation and setup  
✅ Docker image vulnerability scanning  
✅ SARIF output generation  
✅ JSON format validation  
✅ Security findings reporting

### `test:yarn-retry`

✅ Yarn install retry logic testing  
✅ Network timeout simulation  
✅ Registry fallback validation  
✅ Dependency installation verification  
✅ Build functionality after install

### `test:dynamodb-connectivity`

✅ DynamoDB container startup  
✅ Network connectivity  
✅ AWS CLI authentication  
✅ DynamoDB API responsiveness  
✅ Table verification

## Expected Results

When all tests pass, you should see:

- ✅ All components validated
- ✅ GitHub Actions permissions configured
- ✅ Local testing capabilities confirmed
- 🎉 Ready to push to GitHub

## Troubleshooting

If tests fail:

1. Check Docker daemon is running
2. Ensure required tools are installed (AWS CLI, etc.)
3. Verify network connectivity
4. Review error messages for specific component failures

Run individual component tests to isolate issues.
