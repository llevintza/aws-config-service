module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': 'error',

    // General code quality rules
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-undef': 'off', // TypeScript handles this
    'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead

    // Spacing and formatting rules
    'indent': 'off', // Use @typescript-eslint/indent instead
    '@typescript-eslint/indent': ['error', 2],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],
    'comma-trailing': 'off', // Let prettier handle this
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', { 'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always' }],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', { 'words': true, 'nonwords': false }],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],

    // Line ending and whitespace rules
    'eol-last': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }],
    'linebreak-style': ['error', 'unix'],

    // Code organization rules
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'curly': ['error', 'all'],
    'max-len': ['error', { 'code': 100, 'tabWidth': 2, 'ignoreUrls': true, 'ignoreStrings': true }],
    'no-tabs': 'error',

    // Best practices
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    'arrow-spacing': ['error', { 'before': true, 'after': true }],
    'rest-spread-spacing': ['error', 'never'],
    'computed-property-spacing': ['error', 'never'],
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
