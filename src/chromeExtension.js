import React from "react";
import { createRoot } from "react-dom/client";
import FloatingButton from "./components/FloatingButton/FloatingButton";
import { downloadProjectData } from "./utils/projectIdScanner";

const container = document.createElement("div");
document.body.appendChild(container);
createRoot(container).render(<FloatingButton />);

downloadProjectData();

const observer = new MutationObserver(() => {
  downloadProjectData();
});
observer.observe(document.body, { childList: true, subtree: true });
