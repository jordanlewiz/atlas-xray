# Atlas Xray Chrome Extension

A Chrome extension for Atlassian Projects that provides visual timeline insights into project status changes and updates.

## Features

- **Project Timeline**: Visual heatmap showing status changes over time
- **Rich Content**: Renders ProseMirror content with images and formatting
- **Modal Interface**: Clean, full-screen timeline view
- **Smart Caching**: Intelligent data management with IndexedDB

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build
   ```

3. **Load in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

## Development

- **Build**: `npm run build` - Creates extension files
- **Test**: `npm test` - Runs test suite
- **Release**: `npm run release:patch` - Creates new version and triggers GitHub release

## Tech Stack

- React 18 + TypeScript
- Atlaskit UI components
- IndexedDB with Dexie.js
- esbuild for bundling
- GitHub Actions for CI/CD

## Project Structure

```
src/
├── components/          # React components
├── utils/              # Utility functions
├── types/              # TypeScript definitions
├── assets/styles/      # Global styles
└── graphql/            # GraphQL queries
```

## Contributing

1. Make your changes
2. Run tests: `npm test`
3. Build: `npm run build`
4. Create release: `npm run release:minor`

## License

MIT License
