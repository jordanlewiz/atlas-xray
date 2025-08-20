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
        loader: 'js'
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
    external: ['chrome'],
    plugins: [scssLoader]
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
    entryPoints: ['src/contentScripts/contentScript.js'],
    outfile: 'dist/contentScript.js',
    loader: { '.js': 'jsx' }
  });
}

async function buildBackground() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/background/background.js'],
    outfile: 'dist/background.js',
    loader: { '.ts': 'tsx' }
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
