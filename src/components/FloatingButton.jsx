import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import ProjectList from "./ProjectList.jsx";
import Modal from "./Modal.jsx";

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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ol className="atlas-xray-modal-list">
          <ProjectList projects={projectViewModel} />
        </ol>
      </Modal>
    </>
  );
};

export default FloatingButton;
