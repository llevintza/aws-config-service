# Semantic Versioning (SemVer) Implementation

This project implements automated semantic versioning using [semantic-release](https://semantic-release.gitbook.io/semantic-release/) and conventional commits.

## Overview

The project automatically determines the next version number, generates a changelog, and publishes releases based on the commit messages in your pull requests.

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description               | Version Bump      |
| ---------- | ------------------------- | ----------------- |
| `feat`     | New feature               | **Minor** (1.1.0) |
| `fix`      | Bug fix                   | **Patch** (1.0.1) |
| `perf`     | Performance improvement   | **Patch** (1.0.1) |
| `revert`   | Reverts a previous commit | **Patch** (1.0.1) |
| `refactor` | Code refactoring          | **Patch** (1.0.1) |
| `docs`     | Documentation changes     | **No release**    |
| `style`    | Code style changes        | **No release**    |
| `test`     | Test additions/changes    | **No release**    |
| `chore`    | Build process or tools    | **No release**    |
| `ci`       | CI configuration changes  | **No release**    |
| `build`    | Build system changes      | **No release**    |

### Breaking Changes

To trigger a **major** version bump (2.0.0), include `BREAKING CHANGE:` in the commit footer:

```
feat: new authentication system

BREAKING CHANGE: authentication endpoint has changed from /auth to /api/auth
```

### Examples

```bash
# Minor version bump (1.1.0)
feat: add user authentication
feat(api): add JWT token support

# Patch version bump (1.0.1)
fix: resolve memory leak in service
fix(config): handle missing environment variables
perf: optimize database queries

# No version bump
docs: update API documentation
chore: update dependencies
test: add unit tests for auth service

# Major version bump (2.0.0)
feat: redesign API structure

BREAKING CHANGE: API endpoints restructured, see migration guide
```

## Release Process

### Automatic Releases (Recommended)

1. **Create a feature branch** from `main`
2. **Make your changes** with conventional commit messages
3. **Open a Pull Request** to `main`
4. **Merge PR** → Automatic release triggered

### Manual Releases

Use GitHub Actions workflow dispatch:

1. Go to Actions → Release Pipeline
2. Click "Run workflow"
3. Select release type:
   - `auto`: Use semantic-release (recommended)
   - `patch`: Manual patch bump
   - `minor`: Manual minor bump
   - `major`: Manual major bump

## Configuration Files

### `.releaserc.json`

Semantic-release configuration defining:

- Branch configuration (main, beta, alpha)
- Plugins for changelog, git, GitHub releases
- Release rules mapping commit types to version bumps

### `package.json` Scripts

```json
{
  "release": "semantic-release",
  "release:dry-run": "semantic-release --dry-run",
  "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
  "test:semver": "./scripts/test-semver.sh"
}
```

## Docker Image Tagging

Releases automatically create Docker images with semver tags:

```bash
# For version 1.2.3
ghcr.io/owner/repo:1.2.3    # Full version
ghcr.io/owner/repo:1.2      # Major.minor
ghcr.io/owner/repo:1        # Major only
ghcr.io/owner/repo:latest   # Latest stable
```

Pre-releases (beta, alpha) get separate tags:

```bash
ghcr.io/owner/repo:1.2.3-beta.1
ghcr.io/owner/repo:1.2.3-alpha.1
```

## Testing

Test the semver setup:

```bash
yarn test:semver           # Run full semver test suite
yarn release:dry-run       # Test release without publishing
yarn changelog             # Generate changelog preview
```

## Branches

- **`main`**: Production releases (1.0.0, 1.1.0, etc.)
- **`beta`**: Beta releases (1.1.0-beta.1, 1.1.0-beta.2, etc.)
- **`alpha`**: Alpha releases (1.1.0-alpha.1, 1.1.0-alpha.2, etc.)

## GitHub Integration

Releases automatically:

- ✅ Update version in `package.json`
- ✅ Generate and update `CHANGELOG.md`
- ✅ Create Git tag
- ✅ Create GitHub Release with notes
- ✅ Build and tag Docker images
- ✅ Run security scans

## Troubleshooting

### No Release Created

- Check commit messages follow conventional format
- Ensure you're on the `main` branch
- Verify commits contain releasable changes (`feat`, `fix`, etc.)

### Release Failed

- Check GitHub Actions logs
- Verify GITHUB_TOKEN permissions
- Ensure no merge conflicts

### Version Not Bumped

- Use correct commit types (`feat` for minor, `fix` for patch)
- Include `BREAKING CHANGE:` footer for major bumps
- Avoid `docs`, `chore`, `test` for version bumps

## Migration from Manual Versioning

If migrating from manual versioning:

1. Ensure last manual version is tagged
2. Update all commit messages to conventional format going forward
3. Use `yarn release:dry-run` to preview first automated release
4. Merge to `main` to trigger first automated release
