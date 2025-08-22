import React, { useState, useEffect, useRef } from "react";
import { projectPipeline, PipelineState } from "../../services/projectPipeline";
import StatusTimelineHeatmap from "../StatusTimelineHeatmap/StatusTimelineHeatmap";
import ProjectStatusHistoryModal from "../ProjectStatusHistoryModal";
import Tooltip from "@atlaskit/tooltip";

import { db } from "../../utils/database";

/**
 * Floating button that opens the timeline modal.
 * Now uses the ProjectPipeline for progressive data loading.
 */
export default function FloatingButton(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState>(projectPipeline.getState());
  const hasStartedPipeline = useRef(false);

  // Real-time counts from Dexie (always accurate)
  const [counts, setCounts] = useState({ projectsStored: 0, updatesStored: 0, updatesAnalyzed: 0 });
  
  // Poll database for counts every 2 seconds
  useEffect(() => {
    const updateCounts = async () => {
      try {
        const projectsCount = await db.projectView.count();
        const updatesCount = await db.projectUpdates.count();
        const analyzedCount = await db.projectUpdates.where('analyzed').equals(1).count();
        
        setCounts({
          projectsStored: projectsCount,
          updatesStored: updatesCount,
          updatesAnalyzed: analyzedCount
        });
      } catch (error) {
        console.error('[AtlasXray] Failed to update counts:', error);
      }
    };
    
    // Update immediately
    updateCounts();
    
    // Then update every 2 seconds
    const interval = setInterval(updateCounts, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const { projectsStored, updatesStored, updatesAnalyzed } = counts;

  // Subscribe to pipeline state changes
  useEffect(() => {
    const unsubscribe = projectPipeline.subscribe((state) => {
      setPipelineState(state);
    });

    // 🚀 PARALLEL PROCESSING: Trigger initial updates fetch for existing projects
    const triggerInitialFetch = async () => {
      try {
        await projectPipeline.triggerInitialUpdatesFetch();
      } catch (error) {
        console.error('[AtlasXray] Failed to trigger initial updates fetch:', error);
      }
    };
    
    // Trigger after a short delay to ensure pipeline is ready
    const timer = setTimeout(triggerInitialFetch, 1000);
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
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

    // Clean up pipeline when component unmounts
    return () => {
      try {
        projectPipeline.destroy();
      } catch (error) {
        console.warn('[AtlasXray] Error cleaning up pipeline:', error);
      }
    };
  }, []);

  const handleOpenModal = (): void => {
    setModalOpen(true);
    
    // Fetch updates for visible projects when timeline is opened
    // This prevents rate limiting during initial pipeline execution
    const fetchUpdatesForVisibleProjects = async () => {
      try {
        console.log('[AtlasXray] 📥 Fetching updates for visible projects...');
        
        const visibleProjectKeys = pipelineState.projectIds || [];
        let totalUpdatesFetched = 0;
        
        // Fetch updates for each visible project with rate limiting
        for (const projectKey of visibleProjectKeys) {
          try {
            const updatesCount = await projectPipeline.fetchAndStoreProjectUpdates(projectKey);
            totalUpdatesFetched += updatesCount;
            
            // Small delay between projects to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (error) {
            console.error(`[AtlasXray] Failed to fetch updates for ${projectKey}:`, error);
          }
        }
        
        if (totalUpdatesFetched > 0) {
          console.log(`[AtlasXray] ✅ Fetched ${totalUpdatesFetched} updates for ${visibleProjectKeys.length} projects`);
          
          // No need to refresh counts - Dexie queries are real-time!
        }
        
      } catch (error) {
        console.error('[AtlasXray] Error fetching updates for visible projects:', error);
      }
    };
    
    // Fetch updates in the background
    fetchUpdatesForVisibleProjects();
  };

  // Get display text based on real-time Dexie counts
  const getDisplayText = (): string => {
    const { projectsOnPage, isProcessing, error } = pipelineState;

    if (error) {
      return `${projectsOnPage} projects • Error: ${error}`;
    }

    if (isProcessing) {
      return `${projectsOnPage} projects • Loading...`;
    }

    if (projectsStored === 0) {
      return `${projectsOnPage} projects`;
    }

    if (updatesStored === 0) {
      return `${projectsOnPage} projects • ${projectsStored} stored`;
    }

    if (updatesAnalyzed === 0) {
      return `${projectsOnPage} projects • ${projectsStored} stored • ${updatesStored} updates`;
    }

    return `${projectsOnPage} projects • ${projectsStored} stored • ${updatesStored} updates • ${updatesAnalyzed} analyzed`;
  };

  // Get tooltip content
  const getTooltipContent = (): React.ReactNode => {
    const { projectsOnPage, currentStage, error } = pipelineState;

    return (
      <div>
        <div><strong>Pipeline Status</strong></div>
        <div>Projects on page: {projectsOnPage}</div>
        <div>Projects stored: {projectsStored} (from database)</div>
        <div>Updates stored: {updatesStored} (from database)</div>
        <div>Updates analyzed: {updatesAnalyzed} (from database)</div>
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
