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

    // Create updates lookup by project first
    const updatesByProject = {};
    console.log('Processing allUpdates:', allUpdates);
    allUpdates.forEach(update => {
      const key = update.projectKey;
      if (key) {
        // Initialize array if it doesn't exist
        if (!updatesByProject[key]) {
          updatesByProject[key] = [];
        }
        // Add this update to the array
        updatesByProject[key].push(update);
      }
    });
    console.log('Created updatesByProject:', updatesByProject);

    // Transform projects into view models
    const projectViewModels = projects.map(project => {
      const projectUpdates = allUpdates.find(u => u.projectKey === project.projectKey);
      const projectStatusHistory = allStatusHistory.find(s => s.projectKey === project.projectKey);
      
      // Get the latest update for this project
      const latestUpdate = projectUpdates || {};
      const latestStatus = projectStatusHistory || {};

      return {
        projectKey: project.projectKey,
        name: project.project?.name || "",
        state: latestStatus.state || latestUpdate.state,
        oldState: latestStatus.oldState || latestUpdate.oldState,
        newDueDate: latestUpdate.targetDate || latestStatus.targetDate,
        oldDueDate: latestUpdate.oldDueDate || latestStatus.oldDueDate,
        missedUpdate: latestUpdate.missedUpdate || false,
        summary: latestUpdate.summary || latestStatus.summary,
        details: latestUpdate.notes || latestStatus.notes,
        // Raw data for timeline processing
        rawUpdates: projectUpdates ? [projectUpdates] : [],
        rawStatusHistory: projectStatusHistory ? [projectStatusHistory] : []
      };
    });

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
      isLoading: false
    };
  }, [projects, allUpdates, allStatusHistory, weekLimit]);

  return timelineData;
}
