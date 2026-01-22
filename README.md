# Reddit Enhancement Suite Userscript Edition

[![Build](https://github.com/alysson-souza/reddit-enhancement-suite-userscript-edition/actions/workflows/pipeline.yml/badge.svg)](https://github.com/alysson-souza/reddit-enhancement-suite-userscript-edition/actions/workflows/pipeline.yml)

A userscript build of [Reddit Enhancement Suite](https://github.com/honestbleeps/Reddit-Enhancement-Suite) for Greasemonkey, Tampermonkey, and Violentmonkey.

> **No support is provided.** This project is updated when I feel like it. Use at your own risk.

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari, Opera)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
   - [Greasemonkey](https://www.greasespot.net/) (Firefox)

2. Download the latest release from [GitHub Releases](https://github.com/alysson-souza/reddit-enhancement-suite-userscript-edition/releases)

3. Click on `reddit-enhancement-suite.user.js` to install

## Building from Source

```bash
# Install dependencies
yarn install

# Development build
yarn once --browsers userscript

# Production build (minified)
yarn build --browsers userscript
```

Output: `dist/userscript/reddit-enhancement-suite.user.js`

## Differences from Browser Extension

- **English only**: Other locales are not bundled to reduce file size (~1.4 MB vs ~3.9 MB)
- **No background page**: All functionality runs in the content script
- **Storage**: Uses GM_getValue/GM_setValue instead of browser.storage
- **Cross-origin requests**: Uses GM_xmlhttpRequest

## License

GPL-3.0 - See [LICENSE](/LICENSE)

## Credits

Based on [Reddit Enhancement Suite](https://github.com/honestbleeps/Reddit-Enhancement-Suite) by Steve Sobel and contributors.
