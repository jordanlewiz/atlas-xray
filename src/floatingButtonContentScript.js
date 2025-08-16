import React from "react";
import { createRoot } from "react-dom/client";
import FloatingButton from "./components/floatingButton";

const container = document.createElement("div");
document.body.appendChild(container);
createRoot(container).render(<FloatingButton />);
