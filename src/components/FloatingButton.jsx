import React, { useState, useEffect, useRef } from "react";
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
  const observerRef = useRef(null);

  // Function to update visible projects
  const updateVisibleProjects = async () => {
    const matches = await downloadProjectData();
    setVisibleProjectKeys(matches.map(m => m.projectId));
  };

  // Set up MutationObserver to update visible projects on DOM changes
  useEffect(() => {
    updateVisibleProjects(); // Initial run
    const observer = new window.MutationObserver(() => {
      updateVisibleProjects();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

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

  // Modal open handler (no longer needs to update visible projects)
  const handleOpenModal = () => setModalOpen(true);

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
        {weekLimit => (
          <ProjectList projects={filteredProjects} weekLimit={weekLimit} />
        )}
      </Modal>
    </>
  );
};

export default FloatingButton;
