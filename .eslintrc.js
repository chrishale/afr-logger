module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'next/core-web-vitals'
  ],
  plugins: [
    '@typescript-eslint',
    'prettier',
    'unused-imports',
    'simple-import-sort'
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        bracketSpacing: true,
        jsxBracketSameLine: true,
        singleQuote: true,
        semi: false,
        trailingComma: 'none',
        arrowParens: 'avoid'
      }
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ],
    semi: [2, 'never'],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error'
  }
}
