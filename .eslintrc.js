module.exports = {
  extends: ['soybeanjs'],
  settings: {
    'import/core-modules': ['zx']
  },
  overrides: [
    {
      files: ['./scripts/*.ts'],
      rules: {
        'no-unused-expressions': 'off'
      }
    }
  ]
};
