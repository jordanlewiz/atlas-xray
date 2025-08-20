/**
 * Atlas Xray Chrome Extension - Content Script
 * 
 * This content script is injected into Atlassian project pages to:
 * 1. Inject a floating button UI component for user interaction
 * 2. Scan the page for project data and download it to IndexedDB
 * 3. Monitor DOM changes to continuously capture new project data
 * 
 * The script runs on pages matching the host_permissions in manifest.json
 * and provides the core functionality for data extraction and UI injection.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import { downloadProjectData } from "../utils/projectIdScanner";

const container = document.createElement("div");
document.body.appendChild(container);
createRoot(container).render(<FloatingButton />);

downloadProjectData();

const observer = new MutationObserver(() => {
  downloadProjectData();
});
observer.observe(document.body, { childList: true, subtree: true });
