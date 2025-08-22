// Dexie global injection for Chrome extension
// This ensures Dexie is available in the extension's global scope

import Dexie from 'dexie';

// Make Dexie available globally in the extension context
if (typeof window !== 'undefined') {
  window.Dexie = Dexie;
}

// Also try to attach to globalThis if available
if (typeof globalThis !== 'undefined') {
  globalThis.Dexie = Dexie;
}

// Fallback to self for service workers
if (typeof self !== 'undefined') {
  self.Dexie = Dexie;
}

console.log('[AtlasXray] Dexie global injection complete');
