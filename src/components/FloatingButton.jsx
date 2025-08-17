import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import ProjectList from "./ProjectList.jsx";
import Modal from "./Modal.jsx";
import { downloadProjectData } from "../utils/projectIdScanner";

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
  const [visibleProjectKeys, setVisibleProjectKeys] = useState([]);

  // When modal opens, determine visible project(s)
  const handleOpenModal = async () => {
    const matches = await downloadProjectData();
    setVisibleProjectKeys(matches.map(m => m.projectId));
    setModalOpen(true);
  };

  // Compute the view-model: array of { projectKey, name, updateDates }
  const projectViewModel = (projects || []).map(proj => ({
    projectKey: proj.projectKey,
    name: proj.project?.name || "",
    updateDates: (updatesByProject && updatesByProject[proj.projectKey]) ? updatesByProject[proj.projectKey] : []
  }));

  // Filter to only visible projects if any are detected
  const filteredProjects = visibleProjectKeys.length > 0
    ? projectViewModel.filter(p => visibleProjectKeys.includes(p.projectKey))
    : projectViewModel;

  return (
    <>
      <button className="atlas-xray-floating-btn" onClick={handleOpenModal}>
        Atlas Xray
        {visibleProjectKeys.length > 0
          ? ` (${visibleProjectKeys.length}/${projectCount !== undefined ? projectCount : 0})`
          : projectCount !== undefined
            ? ` (${projectCount})`
            : ""}
      </button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ol className="atlas-xray-modal-list">
          <ProjectList projects={filteredProjects} />
        </ol>
      </Modal>
    </>
  );
};

export default FloatingButton;
