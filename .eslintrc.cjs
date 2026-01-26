/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: ['local-test-playground/', 'playground/dist', 'dist'],
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: 1 }],
    '@typescript-eslint/no-explicit-any': 'error',
    'max-len': [
      'error',
      {
        code: 80,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],
  },
};
