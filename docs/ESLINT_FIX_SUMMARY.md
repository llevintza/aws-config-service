# ESLint Configuration and Setup Guide

## Overview

This project now uses a comprehensive ESLint configuration with TypeScript support and modern JavaScript/TypeScript best practices. The linting setup includes automatic code quality checks, import organization, and consistent code styling.

## ESLint Configuration

### Installed Packages

```json
{
  "@typescript-eslint/eslint-plugin": "^7.18.0",
  "@typescript-eslint/parser": "^7.18.0",
  "eslint": "^8.57.1",
  "eslint-config-prettier": "^9.1.0",
  "eslint-import-resolver-typescript": "^4.4.4",
  "eslint-plugin-import": "^2.29.1",
  "eslint-plugin-node": "^11.1.0",
  "eslint-plugin-prettier": "^5.2.1",
  "eslint-plugin-promise": "^6.6.0"
}
```

### Configuration Features

#### TypeScript Integration

- **Parser**: `@typescript-eslint/parser` for TypeScript AST parsing
- **Rules**: Comprehensive TypeScript-specific linting rules
- **Type Checking**: Optional chaining, nullish coalescing, and type safety rules

#### Import Management

- **Import Order**: Automatic import sorting (builtin → external → internal → relative)
- **Duplicate Detection**: Prevents duplicate imports
- **Cycle Detection**: Detects circular dependencies
- **TypeScript Resolution**: Proper module resolution for TypeScript

#### Code Quality Rules

- **Best Practices**: No `eval`, no `with`, prefer template literals
- **Type Safety**: Consistent type definitions, no unnecessary assertions
- **Modern JavaScript**: Prefer `const`, no `var`, arrow functions
- **Error Prevention**: Proper equality checks, curly braces requirement

#### Code Style (Basic)

- **Consistent Formatting**: Trailing commas, proper spacing, quote consistency
- **Import Organization**: Alphabetical sorting within groups
- **Brace Style**: 1TBS (one true brace style) with single-line allowance

## Available Scripts

### Linting Commands

```bash
# Run linting on all TypeScript files
yarn lint

# Run linting with automatic fixes
yarn lint:fix

# Run linting with zero warnings allowed (CI/strict mode)
yarn lint:check
```

### Integration with Development Workflow

The ESLint configuration is integrated with:

1. **Pre-commit Hooks**: Via Husky and lint-staged
2. **Development**: Real-time linting in VS Code
3. **CI/CD**: Strict linting checks in build pipeline

## Configuration Details

### File Structure

```
.eslintrc.js          # Main ESLint configuration
package.json          # Dependencies and scripts
tsconfig.json         # TypeScript config (used by ESLint)
```

### Rule Categories

#### TypeScript Rules

- `@typescript-eslint/no-unused-vars`: Prevent unused variables
- `@typescript-eslint/explicit-function-return-type`: Require return types
- `@typescript-eslint/no-explicit-any`: Warn against `any` usage
- `@typescript-eslint/prefer-nullish-coalescing`: Use `??` instead of `||`
- `@typescript-eslint/prefer-optional-chain`: Use optional chaining
- `@typescript-eslint/consistent-type-definitions`: Prefer interfaces

#### Import Rules

- `import/order`: Sort imports by category and alphabetically
- `import/no-cycle`: Prevent circular dependencies
- `import/no-duplicates`: Remove duplicate imports
- `import/no-unresolved`: Ensure imports resolve correctly

#### Code Quality Rules

- `prefer-const`: Use const for non-reassigned variables
- `no-var`: Prevent var usage
- `prefer-template`: Use template literals over concatenation
- `eqeqeq`: Require strict equality
- `curly`: Require curly braces for all control statements

#### Style Rules

- `quotes`: Single quotes with escape allowance
- `semi`: Required semicolons
- `comma-dangle`: Trailing commas in multiline structures
- `brace-style`: 1TBS brace style
- `object-curly-spacing`: Spacing inside object literals

### Override Configurations

#### JavaScript Files (\*.js)

- Relaxed TypeScript rules
- Allow `require()` statements
- No return type requirements

#### Test Files (**/\*.test.ts, **/_.spec.ts, **/testing/**/_.ts)

- Allow `any` types for test flexibility
- Allow non-null assertions for test convenience
- Allow console statements for debugging

#### Scripts (scripts/\*_/_.ts)

- Allow console statements for script output
- Maintained TypeScript checking for safety

## Usage Examples

### Running Lints

```bash
# Check all files
yarn lint

# Fix automatically fixable issues
yarn lint:fix

# Check with zero tolerance (for CI)
yarn lint:check
```

### Common Fixes

#### Auto-fixable Issues

```typescript
// Before: Missing trailing comma
const config = {
  host: 'localhost',
  port: 3000,
};

// After: Added trailing comma
const config = {
  host: 'localhost',
  port: 3000,
};
```

#### Manual Fixes Required

```typescript
// Before: Using || instead of ??
const port = process.env.PORT || 3000;

// After: Using nullish coalescing
const port = process.env.PORT ?? 3000;
```

## Integration with VS Code

### Recommended VS Code Extensions

1. **ESLint Extension**: Real-time linting feedback
2. **TypeScript Hero**: Import organization
3. **Prettier**: Code formatting (works with ESLint)

### VS Code Settings

Add to your `.vscode/settings.json`:

```json
{
  "eslint.validate": ["typescript"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## Continuous Integration

### Pre-commit Hook

The project uses Husky with lint-staged for pre-commit linting:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "git add"]
  }
}
```

### CI Pipeline

Add to your CI configuration:

```yaml
# Example GitHub Actions
- name: Lint TypeScript
  run: |
    yarn install
    yarn lint:check
```

## Troubleshooting

### Common Issues

#### TypeScript Version Warning

```
WARNING: You are currently running a version of TypeScript which is not officially supported
```

**Solution**: This is just a warning. The linting will work correctly with newer TypeScript versions.

#### Import Resolution Errors

```
Unable to resolve path to module
```

**Solution**: Ensure `tsconfig.json` has correct path mappings and the `eslint-import-resolver-typescript` is installed.

#### Performance Issues

If linting is slow:

1. Add more specific ignore patterns
2. Use `--cache` flag: `eslint --cache src/**/*.ts`
3. Consider using ESLint's flat config format in future versions

### Customization

#### Adding New Rules

To add custom rules, modify `.eslintrc.js`:

```javascript
module.exports = {
  // ... existing config
  rules: {
    // ... existing rules
    'my-custom-rule': 'error',
  },
};
```

#### Disabling Rules

For specific files or lines:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
function legacyFunction(): any {
  // ... code
}

// Or for a single line
const data: any = getData(); // eslint-disable-line @typescript-eslint/no-explicit-any
```

## Best Practices

1. **Run lint before committing**: Use pre-commit hooks
2. **Fix automatically fixable issues**: Use `yarn lint:fix` regularly
3. **Address warnings promptly**: Don't let linting debt accumulate
4. **Use specific disable comments**: When disabling rules, be specific about why
5. **Keep configuration updated**: Regularly update ESLint and plugins

This comprehensive linting setup ensures code quality, consistency, and catches potential issues early in the development process.
