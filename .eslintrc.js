module.exports = {
  env: {
    browser: true,
    es6: true,
    'jest/globals': true,
  },
  extends: [
    // 'airbnb',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    process: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'prettier', '@typescript-eslint', 'react-hooks', 'jest'],
  rules: {
    'no-inner-declarations': 0,

    'react/display-name': 0,
    'react/no-children-prop': 0,

    '@typescript-eslint/no-namespace': 'off', // Namespaces are used to group features without the need for a class or module
    '@typescript-eslint/explicit-function-return-type': 0, // Allow return type inference
    '@typescript-eslint/prefer-interface': 0, // Experiment with removing this sometime
    'react/prop-types': 0, // Prop Types don't add a lot when using TypeScript
    '@typescript-eslint/no-non-null-assertion': 0, // Use this a lot where compiler doesn't pick up that an object will not be null
    '@typescript-eslint/camelcase': 0, // Remove this if ever fully decoupled from fuse. Leaving in for compatibility for now
    '@typescript-eslint/no-explicit-any': 0, // One day remove this. Using during transition from JS
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',

    // note you must disable the base rule as it can report incorrect errors
    // Leaving unused vars has proven a useful Dev tool for indicating future Dev opportunities. Leaving as warning for now
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],

    '@typescript-eslint/no-empty-interface': 0, // Sometimes empty interfaces are useful as flags, or placeholders for future DEV

    // Jest rules
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
