# Contributing

This is a personal fork focused solely on the userscript build. No support is provided, and contributions are not accepted.

If you want to contribute to Reddit Enhancement Suite, please visit the [original repository](https://github.com/honestbleeps/Reddit-Enhancement-Suite).

## Building the Userscript

```bash
# Install dependencies
yarn install

# Development build
yarn once --browsers userscript

# Production build (minified)
yarn build --browsers userscript
```

Output: `dist/userscript/reddit-enhancement-suite.user.js`
