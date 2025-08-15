# Atlas Xray Chrome Extension

Bare bones Chrome extension using React for UI, Sass for CSS, and IndexedDB for browser storage.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Build the extension:
   ```sh
   npm run build
   ```

3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this folder

## Development

- Edit React code in `PopupApp.jsx` and `popup.jsx`.
- Edit styles in `popup.scss`.
- IndexedDB utilities are in `indexeddb.js`.
- Run `npm run build` after making changes.
