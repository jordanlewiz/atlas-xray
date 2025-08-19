import React, { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import type { AtlasXrayDB } from "../types/database";
import StatusTimelineHeatmap from "./StatusTimelineHeatmap/StatusTimelineHeatmap";
import ProjectStatusHistoryModal from "./ProjectStatusHistoryModal";
import { downloadProjectData } from "../utils/projectIdScanner";

/**
 * Floating button that opens the timeline modal.
 */
export default function FloatingButton(): React.JSX.Element {
  const projectCount = useLiveQuery(() => (db as AtlasXrayDB).projectView.count(), []);
  const projects = useLiveQuery(() => (db as AtlasXrayDB).projectView.toArray(), []);
  const updatesByProject = useLiveQuery(
    async () => {
      const updates: Record<string, string[]> = {};
      const allUpdates = await (db as AtlasXrayDB).projectUpdates.toArray();
      for (const update of allUpdates) {
        const key = update.projectKey;
        const edges = update?.projectUpdates?.edges || [];
        updates[key] = edges.map((e: any) => e.node?.creationDate).filter(Boolean);
      }
      return updates;
    },
    []
  );
  
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleProjectKeys, setVisibleProjectKeys] = useState<string[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);

  const updateVisibleProjects = async (): Promise<void> => {
    const matches = await downloadProjectData();
    setVisibleProjectKeys(matches.map(m => m.projectId));
  };

  useEffect(() => {
    updateVisibleProjects();
    const observer = new window.MutationObserver(() => {
      updateVisibleProjects();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const projectViewModel = (projects || []).map((proj: any) => ({
    projectKey: proj.projectKey,
    name: proj.project?.name || "",
    updateDates: (updatesByProject && updatesByProject[proj.projectKey]) ? updatesByProject[proj.projectKey] : []
  }));

  const filteredProjects = visibleProjectKeys.length > 0
    ? projectViewModel.filter(p => visibleProjectKeys.includes(p.projectKey))
    : projectViewModel;

  const handleOpenModal = (): void => setModalOpen(true);

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
      
      <ProjectStatusHistoryModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {(weekLimit: number) => (
          <StatusTimelineHeatmap weekLimit={weekLimit} />
        )}
      </ProjectStatusHistoryModal>
    </>
  );
}
