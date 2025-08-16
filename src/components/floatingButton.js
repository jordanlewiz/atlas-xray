// src/components/floatingButton.js

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";

// Helper: format update dates (optional, can be improved)
function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleString();
}

// Pure component for a single project list item
function ProjectListItem({ project }) {
  return (
    <li className="atlas-xray-modal-list-item">
      {project.projectKey} {project.name ? `- ${project.name}` : ""}
      {project.updateDates.length > 0 && (
        <ul className="atlas-xray-update-list">
          {project.updateDates.map((date, i) => (
            <li key={i}>{formatDate(date)}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

// Pure component for the project list
function ProjectList({ projects }) {
  if (!projects || projects.length === 0) return <li>No projects found.</li>;
  return <>{projects.map((p, i) => <ProjectListItem key={p.projectKey || i} project={p} />)}</>;
}

const FloatingButton = () => {
  const projectCount = useLiveQuery(() => db.projectView.count(), []);
  const projects = useLiveQuery(() => db.projectView.toArray(), []);
  const updatesByProject = useLiveQuery(
    async () => {
      const updates = {};
      const allUpdates = await db.projectUpdates.toArray();
      for (const update of allUpdates) {
        const key = update.projectKey;
        const edges = update?.projectUpdates?.edges || [];
        updates[key] = edges.map(e => e.node?.creationDate).filter(Boolean);
      }
      return updates;
    },
    []
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Compute the view-model: array of { projectKey, name, updateDates }
  const projectViewModel = (projects || []).map(proj => ({
    projectKey: proj.projectKey,
    name: proj.project?.name || "",
    updateDates: (updatesByProject && updatesByProject[proj.projectKey]) ? updatesByProject[proj.projectKey] : []
  }));

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
            <ProjectList projects={projectViewModel} />
          </ol>
        </div>
      )}
    </>
  );
};

export default FloatingButton;
