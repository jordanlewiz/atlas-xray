import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../utils/database";
import type { AtlasXrayDB } from "../../types/database";
import StatusTimelineHeatmap from "../StatusTimelineHeatmap/StatusTimelineHeatmap";
import ProjectStatusHistoryModal from "../ProjectStatusHistoryModal";
import { downloadProjectData, findMatchingProjectLinksFromHrefs } from "../../utils/projectIdScanner";
import Tooltip from "@atlaskit/tooltip";
import { useUpdateQuality } from "../../hooks/useUpdateQuality";

// Utility function to debounce function calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Floating button that opens the timeline modal.
 */
export default function FloatingButton(): React.JSX.Element {
  // Initialize with empty array - will be populated by useEffect
  const [initialProjectIds, setInitialProjectIds] = useState<string[]>([]);
  
  // Run initial DOM scan only once using useMemo
  const syncProjectDetection = useMemo(() => {
    try {
      console.log('[AtlasXray] 🔍 SYNC DOM query starting (useMemo)...');
      
      // Query DOM synchronously for project links - use the same pattern as projectIdScanner
      const projectLinks = document.querySelectorAll('a[href*="/project/"]');
      
      const projectIds: string[] = [];
      
      projectLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          // Use the same regex pattern as projectIdScanner
          let match = href.match(/\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/);
          if (match && match[3]) {
            projectIds.push(match[3]);
          } else {
            // Fallback: try simpler pattern for different URL formats
            match = href.match(/\/project\/([A-Z]+-\d+)/);
            if (match && match[1]) {
              projectIds.push(match[1]);
            }
          }
        }
      });
      
      console.log(`[AtlasXray] 🔍 SYNC Found ${projectIds.length} project links on page:`, projectIds);
      return projectIds;
    } catch (error) {
      console.error('[AtlasXray] ❌ SYNC DOM query failed:', error);
      return [];
    }
  }, []); // Empty deps - only run once
  
  // Comment out heavy database queries for now to focus on basic functionality
  // const projectCount = useLiveQuery(() => (db as AtlasXrayDB).projectView.count(), []);
  // const projects = useLiveQuery(() => (db as AtlasXrayDB).projectView.toArray(), []);
  // const updatesByProject = useLiveQuery(
  //   async () => {
  //     const updates: Record<string, string[]> = {};
  //     const allUpdates = await (db as AtlasXrayDB).projectUpdates.toArray();
  //     for (const update of allUpdates) {
  //       const key = update.projectKey;
  //       const edges = update?.projectUpdates?.edges || [];
  //       updates[key] = edges.map((e: any) => e.node?.creationDate).filter(Boolean);
  //       return updates;
  //     }
  //   },
  //   []
  // );
  
  // Use the update quality hook to get analyzed vs total updates count
  const { updates, qualityData } = useUpdateQuality();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleProjectKeys, setVisibleProjectKeys] = useState<string[]>(syncProjectDetection);
  const [visibleProjectCount, setVisibleProjectCount] = useState<number>(syncProjectDetection.length);
  const observerRef = useRef<MutationObserver | null>(null);
  const hasRunAsyncDetection = useRef<boolean>(false);

  // Initial state set - sync detection complete

  // Initial sync detection complete - state is set

  // Run async project detection to get full data
  React.useEffect(() => {
    // Prevent infinite re-renders - only run once
    if (hasRunAsyncDetection.current) {
      return;
    }
    hasRunAsyncDetection.current = true;
    
    console.log('[AtlasXray] 🔄 Async project detection starting...');
    const startTime = performance.now();
    
    const runAsyncDetection = async () => {
      try {
        // First, just get the project IDs from DOM (fast)
        console.log('[AtlasXray] 🚀 Starting DOM-only project detection...');
        const domMatches = findMatchingProjectLinksFromHrefs(
          Array.from(document.querySelectorAll('a[href]')).map(link => link.getAttribute('href'))
        );
        const projectIds = domMatches.map((m: { projectId: string }) => m.projectId);
        
        console.log(`[AtlasXray] 🔍 DOM Found ${projectIds.length} project links on page`);
        
        // Update UI immediately with DOM results
        setVisibleProjectKeys(projectIds);
        setVisibleProjectCount(projectIds.length);
        
        const domEndTime = performance.now();
        console.log(`[AtlasXray] ✅ DOM detection complete: ${projectIds.length} projects visible in ${(domEndTime - startTime).toFixed(2)}ms`);
        
        // Now run the heavy data fetching in background (non-blocking)
        // RE-ENABLED: Testing downloadProjectData without AI analysis
        if (projectIds.length > 0) {
          setTimeout(async () => {
            try {
              console.log('[AtlasXray] ⏰ Timeout fired, calling downloadProjectData...');
              const matches = await downloadProjectData();
              console.log(`[AtlasXray] ✅ downloadProjectData returned: ${matches.length} projects`);
              const fetchedProjectIds = matches.map(m => m.projectId);
              console.log(`[AtlasXray] 🔄 Background fetch complete: ${fetchedProjectIds.length} projects processed`);
              
              // Update with any additional data found
              if (fetchedProjectIds.length > projectIds.length) {
                setVisibleProjectKeys(fetchedProjectIds);
                setVisibleProjectCount(fetchedProjectIds.length);
                console.log(`[AtlasXray] 🔄 Updated with additional projects: ${fetchedProjectIds.length}`);
              }
            } catch (error) {
              console.error('[AtlasXray] Background data fetch failed:', error);
            }
          }, 100); // Small delay to let UI render first
        }
        
      } catch (error) {
        const endTime = performance.now();
        console.error(`[AtlasXray] ❌ Project detection failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
        setVisibleProjectKeys([]);
        setVisibleProjectCount(0);
      }
    };
    
    // Run immediately
    runAsyncDetection();
  }, []); // Empty deps - run only once on mount

  // Re-enabled for DOM-only updates (now with background data fetching)
  const updateVisibleProjects = useRef(
    debounce(async (): Promise<void> => {
      try {
        console.log('[AtlasXray] 🔄 Updating visible projects (with background data fetch)...');
        
        // Use DOM-only scanning for immediate UI update
        const domMatches = findMatchingProjectLinksFromHrefs(
          Array.from(document.querySelectorAll('a[href]')).map(link => link.getAttribute('href'))
        );
        const projectIds = domMatches.map((m: { projectId: string }) => m.projectId);
        
        console.log(`[AtlasXray] 🔍 DOM Found ${projectIds.length} project links on page during update`);
        
        // Update local state immediately
        setVisibleProjectKeys(projectIds);
        setVisibleProjectCount(projectIds.length);
        
        // Now fetch full data in background for new projects
        if (projectIds.length > 0) {
          setTimeout(async () => {
            try {
              console.log('[AtlasXray] ⏰ Background data fetch for DOM updates...');
              const matches = await downloadProjectData();
              console.log(`[AtlasXray] ✅ Background data fetch for updates complete: ${matches.length} projects`);
            } catch (error) {
              console.error('[AtlasXray] Background data fetch for updates failed:', error);
            }
          }, 100); // Small delay to let UI update first
        }
      } catch (error) {
        console.error('[AtlasXray] Failed to update visible projects:', error);
        setVisibleProjectKeys([]);
        setVisibleProjectCount(0);
      }
    }, 300) // Reduced debounce from 1000ms to 300ms
  );





  // Setup DOM observer AFTER project detection
  useEffect(() => {
    // Smart change detection - only trigger when we actually see NEW project links
    const observer = new window.MutationObserver((mutations) => {
      let newProjectLinksFound = 0;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check if this node itself is a project link
              if (element.matches && element.matches('a[href*="/project/"]')) {
                newProjectLinksFound++;
              }
              
              // Check if this node contains project links
              const projectLinks = element.querySelectorAll?.('a[href*="/project/"]');
              if (projectLinks) {
                newProjectLinksFound += projectLinks.length;
              }
            }
          });
        }
      });
      
      // Only trigger update if we actually found new project links
      if (newProjectLinksFound > 0) {
        console.log(`[AtlasXray] 🔄 Found ${newProjectLinksFound} new project links, updating...`);
        updateVisibleProjects.current();
      }
    });
    
    // More targeted observation - only watch for new nodes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false, // Don't watch attribute changes
      characterData: false // Don't watch text changes
    });
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []); // This runs AFTER the first effect

  // Simplified project view model - just use visible projects
  const projectViewModel = visibleProjectKeys.map((projectKey: string) => ({
    projectKey,
    name: projectKey, // Just use the key for now
    updateDates: [] // Empty for now
  }));

  const filteredProjects = visibleProjectKeys && visibleProjectKeys.length > 0
    ? projectViewModel.filter(p => visibleProjectKeys.includes(p.projectKey))
    : projectViewModel;

  const handleOpenModal = (): void => setModalOpen(true);

  const getTooltipContent = (): React.ReactNode => {
    if (visibleProjectKeys && visibleProjectKeys.length > 0) {
      return (
        <div>
          <div>{visibleProjectKeys.length} projects found on this page</div>
          <div>{getAnalyzedUpdatesCount()} updates analyzed</div>
          <div>{getTotalUpdatesCount()} total updates</div>
        </div>
      );
    } else {
      return "0 projects found on this page";
    }
  };

  // Helper function to count analyzed updates
  const getAnalyzedUpdatesCount = (): number => {
    if (!qualityData) return 0;
    return Object.keys(qualityData).length;
  };

  // Helper function to count total updates
  const getTotalUpdatesCount = (): number => {
    if (!updates) return 0;
    return updates.length;
  };

  // Component ready to render
  // Test: Add a simple render counter to verify no infinite re-renders
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // Only log first few renders to verify it's not infinite
  if (renderCount.current <= 3) {
    console.log(`[AtlasXray] 🔄 Render #${renderCount.current} (should only see 1-3 total)`);
  }

  return (
    <>
      <Tooltip content={getTooltipContent()} position="top">
        <button className="atlas-xray-floating-btn" onClick={handleOpenModal}>
          Atlas Xray
          <span className="updates-count">
            {visibleProjectCount > 0
              ? `${visibleProjectCount}`
              : "0"}
          </span>
          {getTotalUpdatesCount() > 0 && (
            <span className="updates-count">
              {getAnalyzedUpdatesCount()}/{getTotalUpdatesCount()}
            </span>
          )}
        </button>
      </Tooltip>
      
      <ProjectStatusHistoryModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {(weekLimit: number) => (
          <StatusTimelineHeatmap 
            weekLimit={weekLimit} 
            visibleProjectKeys={visibleProjectKeys}
          />
        )}
      </ProjectStatusHistoryModal>
    </>
  );
}
