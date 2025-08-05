# GitHub Actions Security Scanning Fix

## Problem

The GitHub Actions CI workflow was failing at the "Upload Trivy scan results to GitHub Security tab" step with the following error:

```
Warning: Resource not accessible by integration - https://docs.github.com/rest
Error: Resource not accessible by integration - https://docs.github.com/rest
```

This error occurred because the workflow didn't have the necessary permissions to upload security scanning results to GitHub's Security tab.

## Root Cause

The CodeQL action (`github/codeql-action/upload-sarif@v3`) requires specific GitHub token permissions to upload SARIF files to the Security tab. Specifically, it needs:

- `security-events: write` - To upload security scanning results
- `contents: read` - To read repository contents
- `actions: read` - To read workflow metadata

## Solution

### 1. Added Workflow Permissions

Updated `.github/workflows/ci.yml` to include the necessary permissions at the workflow level:

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: ['main', 'develop']

permissions:
  contents: read
  security-events: write
  actions: read
  pull-requests: write
  checks: write

env:
  NODE_VERSION: '22'
  YARN_CACHE_FOLDER: ~/.yarn
```

### 2. Created Local Testing Capabilities

Added comprehensive local testing scripts to verify security scanning works before pushing:

- `yarn test:security-scan` - Tests Trivy vulnerability scanning locally
- Installs Trivy automatically if not present
- Builds Docker image and runs security scan
- Validates SARIF output format
- Provides detailed feedback on scan results

## Technical Details

### Permissions Breakdown

- **`security-events: write`**: Required for uploading SARIF files to GitHub Security tab
- **`contents: read`**: Standard permission for accessing repository files
- **`actions: read`**: Allows reading workflow run information
- **`pull-requests: write`**: Enables commenting on PRs (existing requirement)
- **`checks: write`**: Allows updating check status (existing requirement)

### SARIF Format

The Trivy scanner outputs results in SARIF (Static Analysis Results Interchange Format), which is GitHub's standard for security scan results. The format includes:

- Vulnerability details with severity levels
- Location information for findings
- Rule definitions and metadata
- Tool information and version

### Security Considerations

- The workflow permissions follow the principle of least privilege
- Permissions are scoped to the minimum required for functionality
- No additional repository access is granted beyond what's needed

## Local Testing

Before pushing changes, you can test the security scanning locally:

```bash
# Test Trivy security scanning
yarn test:security-scan

# Test the complete Docker workflow (includes security scanning)
yarn ci:test-docker

# Verify the GitHub Actions fix
yarn verify:github-actions-fix
```

## Expected Behavior

After applying this fix:

1. ✅ The Docker job will complete successfully
2. ✅ Trivy vulnerability scan will run without errors
3. ✅ SARIF results will be uploaded to GitHub Security tab
4. ✅ Security findings will be visible in the repository's Security tab
5. ✅ No more "Resource not accessible by integration" errors

## Verification

The fix has been tested locally with:

- Docker image builds successfully
- Trivy scans complete without errors
- SARIF files are generated and validated
- No permission-related errors in the upload simulation

## References

- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [CodeQL Action Documentation](https://github.com/github/codeql-action)
- [SARIF Format Specification](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)
- [Trivy Security Scanner](https://aquasecurity.github.io/trivy/)
