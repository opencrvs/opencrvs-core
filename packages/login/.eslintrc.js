module.exports = {
  extends: [
    'eslint-config-react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  plugins: ['react', '@typescript-eslint', 'import'],
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true
  },
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    'no-console': 'off',
    'no-return-assign': 'off',
    'no-unreachable': 2,
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/no-relative-parent-imports': 2,
    'import/named': 0,
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/prefer-interface': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    'react/no-unescaped-entities': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.tsx']
      }
    ],
    'react/boolean-prop-naming': 'off',
    'react/sort-comp': 'off',
    'react/sort-prop-types': 'off'
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect'
    }
  },
  globals: {},
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json'
  }
}
