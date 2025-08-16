import 'webext-bridge/background';
import { findMatchingProjectLinksFromHrefs } from './utils/projectLinkUtils';

console.log('[AtlasXray] Background service worker is running');

// Example usage (remove or replace with message handler in real use):
// findMatchingProjectLinksFromHrefs(["/o/abc123/s/def456/project/ORG-123", "/o/abc123/s/def456/project/ORG-123", "/o/xyz789/s/uvw000/project/ORG-456"]);
