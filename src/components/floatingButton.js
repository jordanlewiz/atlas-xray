// src/components/floatingButton.js

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";

const FloatingButton = () => {
  const projectCount = useLiveQuery(() => db.projectView.count(), []);
  const projects = useLiveQuery(() => db.projectView.toArray(), []);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button className="atlas-xray-floating-btn" onClick={() => setModalOpen(true)}>
        Atlas Xray{projectCount !== undefined ? ` (${projectCount})` : ""}
      </button>
      {modalOpen && (
        <div className="atlas-xray-modal">
          <button className="atlas-xray-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
          <h2>Projects</h2>
          <ol className="atlas-xray-modal-list">
            {projects && projects.length > 0 ? (
              projects.map((proj, idx) => (
                <li key={proj.projectKey || idx} style={{ marginBottom: 12 }}>
                  {proj.projectKey} {proj.project?.name ? `- ${proj.project.name}` : ""}
                </li>
              ))
            ) : (
              <li>No projects found.</li>
            )}
          </ol>
        </div>
      )}
    </>
  );
};

export default FloatingButton;
