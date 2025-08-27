import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type ProjectSummary, type ProjectUpdate } from "../services/DatabaseService";
import { getWeekRanges, getAllProjectDates } from "../utils/timelineUtils";
import type { 
  WeekRange, 
  ProjectViewModel, 
  UseTimelineDataReturn 
} from "../types";

export function useTimeline(weekLimit: number = 12) {
  // Fetch projectList first to determine which projects to load
  const projectList = useLiveQuery(() => db.getProjectList(), []) as any[] | undefined;
  
  // Only fetch data for projects that exist in the current projectList
  const projects = useLiveQuery(() => {
    if (!projectList || projectList.length === 0) return [];
    const projectKeys = projectList.map(item => item.projectKey);
    return db.projectSummaries.where('projectKey').anyOf(projectKeys).toArray();
  }, [projectList]) as ProjectSummary[] | undefined;
  
  const allUpdates = useLiveQuery(() => {
    if (!projectList || projectList.length === 0) return [];
    const projectKeys = projectList.map(item => item.projectKey);
    return db.projectUpdates.where('projectKey').anyOf(projectKeys).toArray();
  }, [projectList]) as ProjectUpdate[] | undefined;

  // Transform data into clean view models
  return useMemo(() => {
    if (!projects || !allUpdates) {
      return {
        weekRanges: [],
        projectViewModels: [],
        updatesByProject: {},
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
    
    // Sort projects to match the order from projectList
    let sortedProjects: ProjectSummary[];
    if (projectList && projectList.length > 0) {
      // Create a map of project keys to their position in projectList
      const projectOrder = new Map(projectList.map((item, index) => [item.projectKey, index]));
      
      // Sort projects by their order in projectList
      sortedProjects = [...projects].sort((a, b) => {
        const orderA = projectOrder.get(a.projectKey) ?? Number.MAX_SAFE_INTEGER;
        const orderB = projectOrder.get(b.projectKey) ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
    } else {
      // No projectList available, use projects as-is
      sortedProjects = projects;
    }
    
    // Simple project view models - just basic info + references to data
    const projectViewModels: ProjectViewModel[] = sortedProjects.map((project: ProjectSummary) => {
      // Use the new direct field structure
      const projectName = project.name || "Unknown Project";
      return {
        projectKey: project.projectKey,
        name: projectName,
        rawProject: project
      };
    });

    // Get week ranges for the timeline
    const allDates = getAllProjectDates(projectViewModels, updatesByProject);
    
    if (!allDates.minDate || !allDates.maxDate) {
      return {
        weekRanges: [],
        projectViewModels,
        updatesByProject,
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
      // BUT always include "This week" if it exists in the range
      const startIndex = Math.max(0, lastUpdateWeekIndex - weekLimit + 1);
      limitedWeekRanges = weekRanges.slice(startIndex, lastUpdateWeekIndex + 1);
      
      // Always include "This week" if it's not already in the limited range
      const thisWeekIndex = weekRanges.findIndex(week => week.label === "This week");
      if (thisWeekIndex !== -1 && !limitedWeekRanges.some(week => week.label === "This week")) {
        // Add "This week" to the end of the limited range
        limitedWeekRanges.push(weekRanges[thisWeekIndex]);
      }
    }

    return {
      weekRanges: limitedWeekRanges,
      projectViewModels,
      updatesByProject,
      isLoading: false
    };
  }, [projects, allUpdates, weekLimit]);
}
