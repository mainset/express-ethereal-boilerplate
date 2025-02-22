import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },

  pluginJs.configs.recommended,

  ...tseslint.configs.recommended,

  // pretties
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    rules: {
      // enable: prettier
      'prettier/prettier': 'error',
    },
  },
];
