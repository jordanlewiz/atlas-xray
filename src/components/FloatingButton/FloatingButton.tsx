import React, { useState, useEffect, useRef } from "react";
import { projectPipeline, PipelineState } from "../../services/projectPipeline";
import StatusTimelineHeatmap from "../StatusTimelineHeatmap/StatusTimelineHeatmap";
import ProjectStatusHistoryModal from "../ProjectStatusHistoryModal";
import Tooltip from "@atlaskit/tooltip";

/**
 * Floating button that opens the timeline modal.
 * Now uses the ProjectPipeline for progressive data loading.
 */
export default function FloatingButton(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState>(projectPipeline.getState());
  const hasStartedPipeline = useRef(false);

  // Subscribe to pipeline state changes
  useEffect(() => {
    const unsubscribe = projectPipeline.subscribe((state) => {
      setPipelineState(state);
    });

    return unsubscribe;
  }, []);

  // Start pipeline on mount (only once)
  useEffect(() => {
    if (hasStartedPipeline.current) return;
    hasStartedPipeline.current = true;

    // Start the pipeline in the background (content script handles initial scan)
    const startPipeline = async () => {
      try {
        // Stage 1b-3: Continue with background processing
        setTimeout(async () => {
          try {
            await projectPipeline.runCompletePipeline();
          } catch (error) {
            console.error('[AtlasXray] Pipeline failed:', error);
          }
        }, 2500); // Wait for content script initial scan to complete
      } catch (error) {
        console.error('[AtlasXray] Failed to start pipeline:', error);
      }
    };

    startPipeline();
  }, []);

  const handleOpenModal = (): void => setModalOpen(true);

  // Get display text based on pipeline state
  const getDisplayText = (): string => {
    const { projectsOnPage, projectsStored, projectUpdatesStored, projectUpdatesAnalysed, isProcessing, error } = pipelineState;

    if (error) {
      return `${projectsOnPage} projects • Error: ${error}`;
    }

    if (isProcessing) {
      return `${projectsOnPage} projects • Loading...`;
    }

    if (projectsStored === 0) {
      return `${projectsOnPage} projects`;
    }

    if (projectUpdatesStored === 0) {
      return `${projectsOnPage} projects • ${projectsStored} stored`;
    }

    if (projectUpdatesAnalysed === 0) {
      return `${projectsOnPage} projects • ${projectsStored} stored • ${projectUpdatesStored} updates`;
    }

    return `${projectsOnPage} projects • ${projectsStored} stored • ${projectUpdatesStored} updates • ${projectUpdatesAnalysed} analyzed`;
  };

  // Get tooltip content
  const getTooltipContent = (): React.ReactNode => {
    const { projectsOnPage, projectsStored, projectUpdatesStored, projectUpdatesAnalysed, currentStage, error } = pipelineState;

    return (
      <div>
        <div><strong>Pipeline Status</strong></div>
        <div>Projects on page: {projectsOnPage}</div>
        <div>Projects stored: {projectsStored}</div>
        <div>Updates stored: {projectUpdatesStored}</div>
        <div>Updates analyzed: {projectUpdatesAnalysed}</div>
        <div>Current stage: {currentStage}</div>
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
    );
  };

  // Get actual project keys from the pipeline state
  const actualProjectKeys = pipelineState.projectIds || [];

  return (
    <>
      <Tooltip content={getTooltipContent()} position="top">
        <button className="atlas-xray-floating-btn" onClick={handleOpenModal}>
          <span className="atlas-xray-floating-btn-text">
            {getDisplayText()}
          </span>
        </button>
      </Tooltip>

      <ProjectStatusHistoryModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {(weekLimit: number) => (
          <StatusTimelineHeatmap
            weekLimit={weekLimit}
            visibleProjectKeys={actualProjectKeys}
          />
        )}
      </ProjectStatusHistoryModal>
    </>
  );
}
