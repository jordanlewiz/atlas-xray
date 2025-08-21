import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import { getWeekRanges, getAllProjectDates } from "../utils/timelineUtils";
import type { 
  ProjectView, 
  ProjectUpdate, 
  ProjectStatusHistory, 
  WeekRange, 
  ProjectViewModel, 
  UseTimelineDataReturn 
} from "../types";
import type { AtlasXrayDB } from "../types/database";

export function useTimeline(weekLimit: number = 12) {
  // Fetch raw data from database
  const projects = useLiveQuery(() => (db as AtlasXrayDB).projectView.toArray(), []) as ProjectView[] | undefined;
  const allUpdates = useLiveQuery(() => (db as AtlasXrayDB).projectUpdates.toArray(), []) as ProjectUpdate[] | undefined;
  const allStatusHistory = useLiveQuery(() => (db as AtlasXrayDB).projectStatusHistory.toArray(), []) as ProjectStatusHistory[] | undefined;

  // Transform data into clean view models
  return useMemo(() => {
    if (!projects || !allUpdates || !allStatusHistory) {
      return {
        weekRanges: [],
        projectViewModels: [],
        updatesByProject: {},
        statusByProject: {},
        isLoading: true
      };
    }

    // Group updates by project - simple and direct
    const updatesByProject: Record<string, ProjectUpdate[]> = {};
    allUpdates.forEach((update: ProjectUpdate, index: number) => {
      // Debug first few updates to see structure
      if (index < 3) {
        console.log(`[AtlasXray] Update ${index} structure:`, {
          id: update.id,
          projectKey: update.projectKey,
          creationDate: update.creationDate,
          allKeys: Object.keys(update)
        });
      }
      
      const key = update.projectKey;
      if (key) {
        if (!updatesByProject[key]) {
          updatesByProject[key] = [];
        }
        updatesByProject[key].push(update);
      } else {
        if (index < 3) {
          console.warn(`[AtlasXray] Update ${index} missing projectKey:`, update);
        }
      }
    });
    


    // Group status history by project
    const statusByProject: Record<string, ProjectStatusHistory[]> = {};
    allStatusHistory.forEach((status: ProjectStatusHistory) => {
      const key = status.projectKey;
      if (key) {
        if (!statusByProject[key]) {
          statusByProject[key] = [];
        }
        statusByProject[key].push(status);
      }
    });

    // Simple project view models - just basic info + references to data
    const projectViewModels: ProjectViewModel[] = projects.map((project: ProjectView) => {
      // Try both raw and direct access patterns
      const projectName = project.raw?.project?.name || 
                         project.raw?.name || 
                         (project as any).project?.name || 
                         "Unknown Project";
      return {
        projectKey: project.projectKey,
        name: projectName,
        rawProject: project
      };
    });

    // Get week ranges for the timeline
    const allDates = getAllProjectDates(projectViewModels, updatesByProject);
    
    // Debug: Log the date ranges and update data
    console.log('[AtlasXray] Timeline Debug - Projects:', projectViewModels.length);
    console.log('[AtlasXray] Timeline Debug - Raw updates count:', allUpdates.length);
    console.log('[AtlasXray] Timeline Debug - Updates by project:', Object.keys(updatesByProject).length);
    console.log('[AtlasXray] Timeline Debug - All dates:', allDates);
    
    // Log raw update data structure
    console.log('[AtlasXray] Raw updates sample:', allUpdates.slice(0, 3).map(u => ({
      id: u.id,
      projectKey: u.projectKey,
      creationDate: u.creationDate
    })));
    
    // Log sample update data
    Object.keys(updatesByProject).slice(0, 2).forEach(key => {
      const updates = updatesByProject[key];
      console.log(`[AtlasXray] Sample updates for ${key}:`, updates.slice(0, 2).map(u => ({
        id: u.id,
        projectKey: u.projectKey,
        creationDate: u.creationDate
      })));
    });
    
    if (!allDates.minDate || !allDates.maxDate) {
      console.warn('[AtlasXray] No valid dates found - timeline will be empty');
      return {
        weekRanges: [],
        projectViewModels,
        updatesByProject,
        statusByProject,
        isLoading: false
      };
    }
    
    const weekRanges: WeekRange[] = getWeekRanges(allDates.minDate, allDates.maxDate);
    
    // Instead of taking the last N weeks, take the most recent N weeks that include actual data
    const limitedWeekRanges: WeekRange[] = weekRanges.slice(-weekLimit);

    return {
      weekRanges: limitedWeekRanges,
      projectViewModels,
      updatesByProject,
      statusByProject,
      isLoading: false
    };
  }, [projects, allUpdates, allStatusHistory, weekLimit]);
}
