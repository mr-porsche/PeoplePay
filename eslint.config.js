import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,

  // Global language setting
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Frontend Rules
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  //Backend Rules
  {
    files: ['server/src/**/*.ts', 'server/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Ignore File/Folders
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/data/**', '**/coverage/**'],
  },
);
