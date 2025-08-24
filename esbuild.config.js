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

// SCSS loader for esbuild
const scssLoader = {
  name: 'scss',
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, () => {
      return {
        contents: '/* SCSS files are processed separately by the CSS build step */',
        loader: 'css'  // Changed from 'js' to 'css' to properly handle SCSS imports
      };
    });
  }
};

// Build functions
async function buildPopup() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/components/ChromeExtension/ChromeExtensionEntry.tsx'],
    outfile: 'dist/popup.js',
    loader: { '.ts': 'tsx', '.tsx': 'tsx' },
    external: ['chrome'], // Remove @xenova/transformers from external - bundle it!
    plugins: [scssLoader]
  });
}

// Removed buildContent - redundant with buildChromeExtension

async function buildChromeExtension() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/contentScripts/contentScript.js'],
    outfile: 'dist/contentScript.js',
    loader: { '.js': 'jsx', '.tsx': 'tsx', '.ts': 'tsx' },
    external: ['chrome'], // Remove @xenova/transformers from external - bundle it!
    globalName: 'AtlasXrayExtension',

    plugins: [scssLoader]
  });
}

async function buildBackground() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/background/background.js'],
    outfile: 'dist/background.js',
    loader: { '.ts': 'tsx' },
    external: ['chrome'] // Remove @xenova/transformers from external - bundle it!
  });
}

// Export build functions
module.exports = {
  buildPopup,
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
    // Removed content case - redundant with chromeExtension
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
