import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import StatusTimelineHeatmap from "../StatusTimelineHeatmap/StatusTimelineHeatmap";
import ProjectStatusHistoryModal from "../ProjectStatusHistoryModal";
import Tooltip from "@atlaskit/tooltip";
import { db, getVisibleProjectIds } from "../../utils/database";

/**
 * Simplified floating button that opens the timeline modal.
 * Uses network monitoring for GraphQL detection and useLiveQuery for real-time updates.
 */
export default function FloatingButton(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleProjectKeys, setVisibleProjectKeys] = useState<string[]>([]);

  // 🚀 REAL-TIME COUNTS: Use useLiveQuery for automatic updates
  const projectsFound = useLiveQuery(() => getVisibleProjectIds());
  const projectsStored = useLiveQuery(() => db.projectView.count());
  const updatesStored = useLiveQuery(() => db.projectUpdates.count());
  const updatesAnalyzed = useLiveQuery(() => db.projectUpdates.where('analyzed').equals(1).count());
  
  // Get the count of visible projects (not the full array)
  const projectsVisible = projectsFound ? projectsFound.length : 0;
  
  // Calculate updates available (total updates that could be fetched for visible projects)
  const updatesAvailable = useLiveQuery(async () => {
    if (!projectsFound || projectsFound.length === 0) return 0;
    
    // For now, we'll estimate based on visible projects
    // This could be enhanced to track actual available updates per project
    return projectsFound.length * 10; // Rough estimate: 10 updates per project on average
  }) || 0;

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[AtlasXray] 🚀 Initializing floating button...');
        
        // Get initial visible projects
        const initialProjects = await getVisibleProjectIds();
        setVisibleProjectKeys(initialProjects);
        console.log(`[AtlasXray] 📋 Initial visible projects: ${initialProjects.length}`);
        
      } catch (error) {
        console.error('[AtlasXray] Failed to initialize:', error);
      }
    };
    
    initialize();
  }, []);

  const handleOpenModal = async (): Promise<void> => {
    console.log('[AtlasXray] 🚪 Opening modal...');
    setModalOpen(true);
    
    // Update visible project keys when modal opens
    const updateVisibleProjects = async () => {
      try {
        const currentProjects = await getVisibleProjectIds();
        setVisibleProjectKeys(currentProjects);
        console.log(`[AtlasXray] 📋 Updated visible projects: ${currentProjects.length}`);
      } catch (error) {
        console.error('[AtlasXray] Error updating visible projects:', error);
      }
    };
    
    await updateVisibleProjects();
    
    // 🚀 PERFORMANCE OPTIMIZATION: Fetch project updates only when modal opens
    if (visibleProjectKeys.length > 0) {
      console.log(`[AtlasXray] 🚀 Modal opened - now fetching project updates for ${visibleProjectKeys.length} projects...`);
      
      try {
        // Use the modal data fetcher to get project updates and analyze them
        const { modalDataFetcher } = await import('../../services/modalDataFetcher');
        const result = await modalDataFetcher.fetchProjectUpdatesForModal();
        console.log(`[AtlasXray] ✅ Modal data fetch complete: ${result.fetched} updates fetched, ${result.analyzed} analyzed`);
      } catch (error) {
        console.error('[AtlasXray] ❌ Failed to fetch modal data:', error);
      }
    }
  };

  // Get display text with all 5 hardcoded metrics
  const getDisplayText = (): string => {
    return `Projects Visible: ${projectsVisible} | ProjectsStored: ${projectsStored || 0} | Updates Available: ${updatesAvailable} | Updates Stored: ${updatesStored || 0} | Updates Analyzed: ${updatesAnalyzed || 0}`;
  };

  // Get tooltip content with all 5 hardcoded metrics
  const getTooltipContent = (): React.ReactNode => {
    return (
      <div>
        <div><strong>Atlas Xray Status</strong></div>
        <div>Projects Visible (on page): {projectsVisible}</div>
        <div>Projects Stored (in local DB): {projectsStored || 0}</div>
        <div>Updates Available (for all stored Projects): {updatesAvailable}</div>
        <div>Updates Stored: {updatesStored || 0}</div>
        <div>Updates Analyzed: {updatesAnalyzed || 0}</div>
        <div>Project Fetching: Direct GraphQL API</div>
      </div>
    );
  };

  // Use visible project keys from state
  const actualProjectKeys = visibleProjectKeys;

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
