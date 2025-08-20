/**
 * Atlas Xray Chrome Extension - Popup Entry Point
 * 
 * This file bootstraps the React popup UI when the extension icon is clicked.
 * It creates a React root and renders the main PopupApp component into the DOM.
 * 
 * The popup provides version information, update status, and site access details
 * to help users understand the extension's current state and capabilities.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./PopupApp";

// Bootstrap the React app
const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
