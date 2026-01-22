# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
yarn start                      # Watch mode development build
yarn once                       # Single development build
yarn build                      # Production build with zip for all browsers
yarn start --browsers chrome    # Target specific browser(s)
```

Build outputs to `/dist/` with browser-specific subdirectories.

## Testing

**Unit tests (AVA):**
```bash
yarn test                       # Run all unit tests
```
Tests are in `lib/**/__tests__/` directories. Test files use Flow types and ES6 imports.

**Integration tests (Nightwatch):**
```bash
yarn integration chrome         # Run integration tests
```
Requires Selenium Standalone Server + ChromeDriver/GeckoDriver.

## Linting

```bash
yarn lint                       # Run all linters (ESLint, stylelint, i18n-lint)
yarn lint-fix                   # Auto-fix ESLint and stylelint issues
yarn flow                       # Type checking
yarn eslint . --fix             # ESLint only with fixes
yarn stylelint lib/**/*.scss --fix  # stylelint only with fixes
```

## Architecture

**Entry Points:**
- `foreground.entry.js` - Content scripts entry
- `background.entry.js` - Background scripts entry

**Source Structure (`/lib/`):**
- `/core/` - Module system, initialization, host detection
- `/modules/` - Feature modules (90+), each in own directory with tests
- `/modules/hosts/` - Media host detection modules
- `/environment/` - Browser API abstraction (background/foreground)
- `/utils/` - Utility functions
- `/css/` - SCSS stylesheets, module-specific styles prefixed with underscore
- `/options/` - Settings UI

**Browser-specific:**
- `/chrome/`, `/firefox/` - Manifests and assets per browser

## Module Pattern

Modules extend `Module` class from `lib/core/module.js`:

```javascript
/* @flow */
import { Module } from '../core/module';

export const module: Module<*> = new Module('moduleID');

module.moduleName = 'moduleName';
module.category = 'categoryName';
module.description = 'moduleDescription';

module.options = {
    optionName: {
        type: 'boolean',
        value: true,
        description: 'optionDescription',
    },
};

module.beforeLoad = () => { /* before page load */ };
module.go = () => { /* main logic */ };
```

Lifecycle hooks: `beforeLoad`, `contentStart`, `go`, `afterLoad`, `always`

Option types: `boolean`, `text`, `color`, `list`, `enum`, `button`, `table`, `builder`

Register new modules in `lib/modules/index.js`.

## Code Conventions

- Flow type annotations required (`/* @flow */` header)
- Tab indentation, single quotes
- ES6 module syntax (import/export)
- No `var` (use `const`/`let`)
- No C-style for loops (use `for..of`)

**Import restrictions (ESLint enforced):**
- Modules cannot import from core/environment/utils
- Core cannot import from modules
- Environment cannot import from core/modules

## Internationalization (i18n)

Keys in `locales/locales/en.json`. Use literal strings for keys (not concatenated):
- Module names: `{moduleName}`
- Options: `{moduleId}Options{OptionName}Title`, `{moduleId}Options{OptionName}Desc`

```bash
yarn i18n-lint                  # Check for unused i18n keys
yarn autoi18n                   # Auto-transform code for i18n
```

## CSS Conventions

- SCSS files in `lib/css/`, module-specific: `_moduleName.scss`
- Toggle classes: `.res-{moduleID}-{optionKey}`
- Import new styles in `lib/css/res.scss`

## Example Templates

- `examples/module.js` - Annotated module template
- `examples/host.js` - Annotated media host template
