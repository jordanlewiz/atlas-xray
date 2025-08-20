import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./popup";

// Bootstrap the React app
const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
