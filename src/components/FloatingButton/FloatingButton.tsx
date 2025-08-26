import React, { useState } from 'react';
import ProjectStatusHistoryModal from '../ProjectStatusHistoryModal';
import { StatusTimelineHeatmap } from '../StatusTimelineHeatmap';
import { fetchProjectsList } from '../../services/FetchProjectsList';
import { fetchProjectsSummary } from '../../services/FetchProjectsSummary';
import { fetchProjectsUpdates } from '../../services/FetchProjectsUpdates';
import { bootstrapService } from '../../services/bootstrapService';
import './FloatingButton.scss';
import Tooltip from "@atlaskit/tooltip";

export default function FloatingButton(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = async (): Promise<void> => {
    console.log('[AtlasXray] 🚪 Floating button clicked - starting sequential fetch');
    
    try {
      setIsLoading(true);
      
      // Step 1: Load bootstrap data
      console.log('[AtlasXray] 📋 Step 1: Loading bootstrap data...');
      await bootstrapService.loadBootstrapData();
      
      // Step 2: Fetch project list
      console.log('[AtlasXray] 📋 Step 2: Fetching project list...');
      const projectKeys = await fetchProjectsList.getProjectList();
      console.log(`[AtlasXray] ✅ Step 2 complete: Found ${projectKeys.length} projects`);
      
      // Step 3: Fetch project summaries (includes dependencies)
      console.log('[AtlasXray] 📋 Step 3: Fetching project summaries...');
      await fetchProjectsSummary.getProjectSummaries(projectKeys);
      console.log('[AtlasXray] ✅ Step 3 complete: Project summaries fetched');
      
      // Step 4: Fetch project updates
      console.log('[AtlasXray] 📋 Step 4: Fetching project updates...');
      await fetchProjectsUpdates.getProjectUpdates(projectKeys);
      console.log('[AtlasXray] ✅ Step 4 complete: Project updates fetched');
      
      // Step 5: Open modal (heatmap will load automatically)
      console.log('[AtlasXray] 🎉 All data fetched! Opening modal...');
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
            visibleProjectKeys={[]} // Will be populated by useLiveQuery in the component
          />
        </div>
      </ProjectStatusHistoryModal>
    </>
  );
}
