import React, { useState } from 'react';
import ProjectStatusHistoryModal from '../ProjectStatusHistoryModal';
import { StatusTimelineHeatmap } from '../StatusTimelineHeatmap';
import { fetchProjectsList } from '../../services/FetchProjectsList';
import { fetchProjectsSummary } from '../../services/FetchProjectsSummary';
import { fetchProjectsUpdates } from '../../services/FetchProjectsUpdates';
import { bootstrapService } from '../../services/bootstrapService';
import './FloatingButton.scss';
import Tooltip from "@atlaskit/tooltip";
import { db } from '../../services/DatabaseService';

export default function FloatingButton(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Step 0: Complete database reset
      try {
        //await db.clearProjectList();
        await db.projectList.clear();
      } catch (error) {
        console.error('[AtlasXray] ⚠️ Warning: Some tables could not be cleared:', error);
        // Continue anyway - we'll overwrite the data
      }
      
      // Step 1: Load bootstrap data
      await bootstrapService.loadBootstrapData();
      
      // Step 2: Fetch project list
      const projectKeys = await fetchProjectsList.getProjectList();
      
      // Step 3: Fetch project summaries (includes dependencies)
      await fetchProjectsSummary.getProjectSummaries(projectKeys);
      
      // Step 4: Fetch project updates
      await fetchProjectsUpdates.getProjectUpdates(projectKeys);
      
      // Step 5: Open modal (heatmap will load automatically)
      setModalOpen(true);

    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to fetch data:', error);
      alert(`Failed to load project data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get display text
  const getDisplayText = (): React.ReactNode => {
    if (isLoading) {
      return (
        <div className="loading-text">
          <span className="spinner">⏳</span>
          <span>Loading...</span>
        </div>
      );
    }

    return (
      <div className="initial-text">
        <span>🚀</span>
        <span>Atlas Xray</span>
      </div>
    );
  };

  // Get tooltip content
  const getTooltipContent = (): string => {
    if (isLoading) {
      return 'Loading project data...';
    }
    return 'Click to load and view project data';
  };

  return (
    <>
      <Tooltip content={getTooltipContent()} position="top">
        <button
          className="atlas-xray-floating-btn"
          onClick={handleOpenModal}
          disabled={isLoading}
        >
          <span className="atlas-xray-floating-btn-text">
            {getDisplayText()}
          </span>
        </button>
      </Tooltip>

              <ProjectStatusHistoryModal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="modal-content">
            <StatusTimelineHeatmap
              weekLimit={12}
              // No visibleProjectKeys filter - show all projects
            />
          </div>
        </ProjectStatusHistoryModal>
    </>
  );
}
