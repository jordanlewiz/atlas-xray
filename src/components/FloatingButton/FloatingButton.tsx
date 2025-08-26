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
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleOpenModal = async (): Promise<void> => {
    console.log('[AtlasXray] 🚪 Floating button clicked - starting clean service-based data flow');
    
    if (dataLoaded) {
      // Data already loaded, just open modal
      setModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      console.log('[AtlasXray] 🔄 Starting clean service-based data loading...');

      // 0. Bootstrap - load workspace context first
      console.log('[AtlasXray] 🚀 Step 0: Loading bootstrap data (workspace context)...');
      await bootstrapService.loadBootstrapData();
      
      // Verify bootstrap data was loaded
      const workspaces = bootstrapService.getWorkspaces();
      if (!workspaces || workspaces.length === 0) {
        throw new Error('Failed to load workspace context. Please refresh the page and try again.');
      }
      console.log(`[AtlasXray] ✅ Step 0 complete: Bootstrap data loaded (${workspaces.length} workspaces available)`);

      // 1. FetchProjectsList - get basic project list
      console.log('[AtlasXray] 📋 Step 1: Fetching project list...');
      const projectKeys = await fetchProjectsList.getProjectList();
      console.log(`[AtlasXray] ✅ Step 1 complete: Found ${projectKeys.length} projects`);

      if (projectKeys.length === 0) {
        throw new Error('No projects found. Please ensure you are on a valid Atlassian projects page.');
      }


      // All data loaded successfully
      setDataLoaded(true);
      console.log(`[AtlasXray] 🎉 All data loaded successfully! Found ${projectKeys.length} projects with complete information`);
      
      // Open modal
      setModalOpen(true);

    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to load data:', error);
      alert(`Failed to load project data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get display text - simplified for loading state
  const getDisplayText = (): React.ReactNode => {
    if (isLoading) {
      return (
        <div className="loading-text">
          <span className="spinner">⏳</span>
          <span>Loading...</span>
        </div>
      );
    }

    if (dataLoaded) {
      return (
        <div className="data-loaded-text">
          <span>📊</span>
          <span>View Status</span>
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
  const getTooltipContent = (): React.ReactNode => {
    if (isLoading) {
      return 'Loading project data...';
    }

    if (dataLoaded) {
      return 'Click to view project status timeline';
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
