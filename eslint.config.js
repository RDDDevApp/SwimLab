// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Edge Functions Supabase : runtime Deno, imports npm:/jsr: non resolubles par Node
    ignores: ['dist/*', 'supabase/functions/*'],
  },
  {
    rules: {
      // Regle prevue pour le JSX HTML : en React Native, <Text> affiche les apostrophes telles quelles
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['jest.setup.js', 'src/__tests__/**'],
    languageOptions: {
      globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly' },
    },
  },
]);
