# Branch Protection Configuration Guide

To enhance your automation, configure these branch protection rules in GitHub:

## Navigate to: Settings → Branches → Add Rule

### Main Branch Protection Rules:

1. **Branch name pattern**: `main`

2. **Protect matching branches**:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1 (can be auto-approved by workflow)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require review from code owners (optional)

3. **Require status checks to pass before merging**:
   - ✅ Require branches to be up to date before merging
   - **Required status checks**:
     - `Build & Test (22)`
     - `PR Validation`
     - `Quality Gate`
     - `Security & Compliance`
     - `Auto-review User PRs` (from the new workflow)

4. **Additional restrictions**:
   - ✅ Restrict pushes that create files larger than 100MB
   - ✅ Allow force pushes (for your own pushes only)
   - ✅ Allow deletions (for your own deletions only)

## Benefits:
- PRs cannot be merged without passing all checks
- Auto-approval still requires all CI checks to pass
- Maintains code quality even with automation
- Prevents accidental direct pushes to main
