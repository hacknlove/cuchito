module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'no-shadow': 0,
    'prefer-destructuring': 0,
    'prefer-template': 0,
    'array-callback-return': 0,
    'import/prefer-default-export': 0,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    'no-continue': 0,
    'consistent-return': 0,
    'no-use-before-define': 0,
    'no-plusplus': 0,
    'no-restricted-syntax': 0,
  },
};
