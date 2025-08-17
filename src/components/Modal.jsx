import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="atlas-xray-modal">
      <button className="atlas-xray-modal-close" onClick={onClose}>&times;</button>
      <h2>Projects</h2>
      {children}
    </div>
  );
}
