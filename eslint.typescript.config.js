// Typescript related linter rules have proved costly to run in VS Code and development environments.
// Run them only in CI/explicit mode.
module.exports = {
  rules: {
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/return-await': 'error'
  }
}
