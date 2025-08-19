import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import { getWeekRanges, getAllProjectDates } from "../utils/timelineUtils";

export function useTimelineData(weekLimit = 12) {
  // Fetch raw data from database
  const projects = useLiveQuery(() => db.projectView.toArray(), []);
  const allUpdates = useLiveQuery(() => db.projectUpdates.toArray(), []);
  const allStatusHistory = useLiveQuery(() => db.projectStatusHistory.toArray(), []);

  // Transform data into clean view models
  const timelineData = useMemo(() => {
    if (!projects || !allUpdates || !allStatusHistory) {
      return {
        weekRanges: [],
        projectViewModels: [],
        updatesByProject: {},
        isLoading: true
      };
    }

    // Group updates by project - simple and direct
    const updatesByProject = {};
    allUpdates.forEach(update => {
      const key = update.projectKey;
      if (key) {
        if (!updatesByProject[key]) {
          updatesByProject[key] = [];
        }
        updatesByProject[key].push(update);
      }
    });

    // Group status history by project
    const statusByProject = {};
    allStatusHistory.forEach(status => {
      const key = status.projectKey;
      if (key) {
        if (!statusByProject[key]) {
          statusByProject[key] = [];
        }
        statusByProject[key].push(status);
      }
    });

    // Simple project view models - just basic info + references to data
    const projectViewModels = projects.map(project => ({
      projectKey: project.projectKey,
      name: project.project?.name || "Unknown Project",
      // Keep it simple - just store the raw project data
      rawProject: project
    }));

    // Get week ranges for the timeline using the correct parameters
    console.log('About to call getAllProjectDates with:', { 
      projectViewModelsCount: projectViewModels.length,
      updatesByProjectKeys: Object.keys(updatesByProject),
      sampleProject: projectViewModels[0],
      sampleUpdates: updatesByProject[Object.keys(updatesByProject)[0]]
    });
    
    const allDates = getAllProjectDates(projectViewModels, updatesByProject);
    console.log('getAllProjectDates result:', allDates);
    
    // Handle case where no valid dates are found
    if (!allDates.minDate || !allDates.maxDate) {
      console.warn('No valid dates found for timeline');
      return {
        weekRanges: [],
        projectViewModels,
        updatesByProject,
        statusByProject: {},
        isLoading: false
      };
    }
    
    console.log('Creating week ranges from:', allDates.minDate, 'to', allDates.maxDate);
    const weekRanges = getWeekRanges(allDates.minDate, allDates.maxDate);
    console.log('Week ranges created:', weekRanges);
    
    const limitedWeekRanges = weekRanges.slice(-weekLimit);
    console.log('Limited week ranges:', limitedWeekRanges);

    return {
      weekRanges: limitedWeekRanges,
      projectViewModels,
      updatesByProject,
      statusByProject,
      isLoading: false
    };
  }, [projects, allUpdates, allStatusHistory, weekLimit]);

  return timelineData;
}
