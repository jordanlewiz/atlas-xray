import React, { useState } from 'react';
import ProjectStatusHistoryModal from '../ProjectStatusHistoryModal';
import { StatusTimelineHeatmap } from '../StatusTimelineHeatmap';
import { fetchProjectsList } from '../../services/FetchProjectsList';
import { bootstrapService } from '../../services/bootstrapService';
import './FloatingButton.scss';
import Tooltip from "@atlaskit/tooltip";

export default function FloatingButton(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = async (): Promise<void> => {
    console.log('[AtlasXray] 🚪 Floating button clicked - starting data fetch');
    
    try {
      setIsLoading(true);
      
      // Load bootstrap data for workspace context
      await bootstrapService.loadBootstrapData();
      
      // Fetch fresh project list (service handles all DB logic internally)
      const projectKeys = await fetchProjectsList.getProjectList();
      console.log(`[AtlasXray] ✅ Found ${projectKeys.length} projects`);
      
      // Open modal
      setModalOpen(true);

    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to fetch projects:', error);
      alert(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            visibleProjectKeys={[]} // Will be populated by useLiveQuery in the component
          />
        </div>
      </ProjectStatusHistoryModal>
    </>
  );
}
