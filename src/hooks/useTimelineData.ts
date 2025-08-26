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
  // Fetch raw data from database
  const projects = useLiveQuery(() => db.projectSummaries.toArray(), []) as ProjectSummary[] | undefined;
  const allUpdates = useLiveQuery(() => db.projectUpdates.toArray(), []) as ProjectUpdate[] | undefined;

  // Debug logging to see what we're getting
  console.log('[useTimeline] 🔍 Debug data:', {
    projectsCount: projects?.length || 0,
    updatesCount: allUpdates?.length || 0,
    projects: projects?.slice(0, 3), // First 3 projects
    updates: allUpdates?.slice(0, 3)  // First 3 updates
  });

  // Transform data into clean view models
  return useMemo(() => {
    if (!projects || !allUpdates) {
      console.log('[useTimeline] ❌ Missing data:', { 
        hasProjects: !!projects, 
        hasUpdates: !!allUpdates,
        projectsLength: projects?.length,
        updatesLength: allUpdates?.length
      });
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
    




    // Simple project view models - just basic info + references to data
    const projectViewModels: ProjectViewModel[] = projects.map((project: ProjectSummary) => {
      // Use the new direct field structure
      const projectName = project.name || "Unknown Project";
      return {
        projectKey: project.projectKey,
        name: projectName,
        rawProject: project
      };
    });

    console.log('[useTimeline] ✅ Created project view models:', {
      count: projectViewModels.length,
      sample: projectViewModels.slice(0, 3)
    });

    // Get week ranges for the timeline
    const allDates = getAllProjectDates(projectViewModels, updatesByProject);
    
    if (!allDates.minDate || !allDates.maxDate) {
      console.warn('[AtlasXray] No valid dates found - timeline will be empty');
          return {
      weekRanges: [],
      projectViewModels,
      updatesByProject,
      isLoading: false
    };
    }
    
    const weekRanges: WeekRange[] = getWeekRanges(allDates.minDate, allDates.maxDate);
    
    console.log('[useTimeline] 📅 Week ranges generated:', {
      minDate: allDates.minDate,
      maxDate: allDates.maxDate,
      weekRangesCount: weekRanges.length,
      sampleWeeks: weekRanges.slice(0, 3)
    });
    
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
