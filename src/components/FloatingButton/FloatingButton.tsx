import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import ProjectStatusHistoryModal from '../ProjectStatusHistoryModal';
import { StatusTimelineHeatmap } from '../StatusTimelineHeatmap';
import { getVisibleProjectIds, getTotalUpdatesAvailableCount, db } from '../../services/DatabaseService';
import { formatFloatingButtonMetrics, formatFloatingButtonTooltip, type FloatingButtonMetrics } from './metricsDisplay';
import './FloatingButton.scss';
import Tooltip from "@atlaskit/tooltip";

export default function FloatingButton(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleProjectKeys, setVisibleProjectKeys] = useState<string[]>([]);

  // 🚀 REAL-TIME COUNTS: Use LiveQuery for automatic updates
  const projectsFound = useLiveQuery(() => getVisibleProjectIds());
  const projectsStored = useLiveQuery(() => db.projectViews.count());
  
  // Get all updates and filter properly
  const allUpdates = useLiveQuery(() => db.projectUpdates.toArray()) || [];
  
  // Filter out missed updates for consistency with server counts
  const nonMissedUpdates = allUpdates.filter(update => !update.missedUpdate);
  const updatesStored = nonMissedUpdates.length;
  
  // Count analyzed updates (those that have been processed, regardless of score)
  const updatesAnalyzed = nonMissedUpdates.filter(update => update.analyzed).length;
  
  // Get the count of visible projects (not the full array)
  const projectsVisible = projectsFound ? projectsFound.length : 0;
  
  // Calculate updates available (count from server stored in database)
  const updatesAvailable = useLiveQuery(() => getTotalUpdatesAvailableCount()) || 0;

  // Create metrics object for display utilities
  const displayMetrics: FloatingButtonMetrics = {
    projectsVisible,
    projectsStored: projectsStored || 0,
    updatesAvailable,
    updatesStored: updatesStored || 0,
    updatesAnalyzed: updatesAnalyzed || 0
  };

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
    
    console.log(`[AtlasXray] 🚀 Modal opened - project data already fetched and ready for timeline`);
  };

  // Get display text using utility function - HTML formatted for better readability
  const getDisplayText = (): React.ReactNode => {
    const htmlText = formatFloatingButtonMetrics(displayMetrics);
    const lines = htmlText.split('\n');
    
    return (
      <>
        {lines.map((line: string, index: number) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </>
    );
  };

  // Get tooltip content as a React component - consistent with display text
  const getTooltipContent = (): React.ReactNode => {
    const tooltipText = formatFloatingButtonTooltip(displayMetrics);
    const lines = tooltipText.split('\n');
    
    return (
      <div>
        {lines.map((line: string, index: number) => (
          <div key={index}>
            {line.includes('Atlas Xray Status') ? (
              <strong>{line}</strong>
            ) : (
              line
            )}
          </div>
        ))}
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
};
