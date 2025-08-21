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
    allUpdates.forEach((update: ProjectUpdate) => {
      const key = update.projectKey;
      if (key) {
        if (!updatesByProject[key]) {
          updatesByProject[key] = [];
        }
        updatesByProject[key].push(update);
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
    
    // Instead of taking the last N weeks, take N weeks that include actual data
    // Find weeks that contain updates and ensure we show enough context
    let limitedWeekRanges: WeekRange[];
    
    // Find the last week that contains updates
    let lastUpdateWeekIndex = -1;
    for (let i = weekRanges.length - 1; i >= 0; i--) {
      const week = weekRanges[i];
      const hasUpdates = Object.values(updatesByProject).some(updates => 
        updates.some(update => {
          if (update.creationDate) {
            const updateDate = new Date(update.creationDate);
            return updateDate >= week.start && updateDate < week.end;
          }
          return false;
        })
      );
      if (hasUpdates) {
        lastUpdateWeekIndex = i;
        break;
      }
    }
    
    if (lastUpdateWeekIndex === -1) {
      // No updates found, show last N weeks
      limitedWeekRanges = weekRanges.slice(-weekLimit);
    } else {
      // Show weeks from the last update week backwards, ensuring we show enough context
      const startIndex = Math.max(0, lastUpdateWeekIndex - weekLimit + 1);
      limitedWeekRanges = weekRanges.slice(startIndex, lastUpdateWeekIndex + 1);
    }



    return {
      weekRanges: limitedWeekRanges,
      projectViewModels,
      updatesByProject,
      statusByProject,
      isLoading: false
    };
  }, [projects, allUpdates, allStatusHistory, weekLimit]);
}
