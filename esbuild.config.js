// esbuild configuration for Atlas Xray Chrome Extension
const esbuild = require('esbuild');

// Common build options
const commonOptions = {
  bundle: true,
  format: 'iife',
  jsx: 'automatic',
  logLevel: 'error',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};

// Build functions
async function buildPopup() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/popup.tsx'],
    outfile: 'dist/popup.js',
    loader: { '.ts': 'tsx' }
  });
}

async function buildContent() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/components/FloatingButton/FloatingButton.tsx'],
    outfile: 'dist/floatingButton.js',
    loader: { '.ts': 'tsx' }
  });
}

async function buildChromeExtension() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/chromeExtension.js'],
    outfile: 'dist/chromeExtension.js',
    loader: { '.js': 'jsx' }
  });
}

async function buildBackground() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/background.js'],
    outfile: 'dist/background.js'
  });
}

// Export build functions
module.exports = {
  buildPopup,
  buildContent,
  buildChromeExtension,
  buildBackground
};

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];
  switch (command) {
    case 'popup':
      buildPopup();
      break;
    case 'content':
      buildContent();
      break;
    case 'chromeExtension':
      buildChromeExtension();
      break;
    case 'background':
      buildBackground();
      break;
    default:
      console.log('Usage: node esbuild.config.js [popup|content|chromeExtension|background]');
  }
}
