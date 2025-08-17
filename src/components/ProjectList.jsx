import React, { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import ProjectTimeline from "./ProjectTimeline.jsx";
import ProjectListItem from "./ProjectListItem.jsx";

/**
 * Builds the view model for the project list, including per-project view models and timeline data.
 * @param {Array} projects - Raw project data
 * @param {Array} allUpdates - All updates from DB
 * @param {Array} allStatusHistory - All status history from DB
 * @returns {Object} { projectViewModels, timelineViewModel }
 */
function createProjectListViewModel(projects, allUpdates, allStatusHistory) {
  const projectViewModels = (projects || []).map(proj => {
    const updates = (allUpdates || []).filter(u => u.projectKey === proj.projectKey);
    const statusHistory = (allStatusHistory || []).filter(s => s.projectKey === proj.projectKey);
    return {
      projectKey: proj.projectKey,
      name: proj.name,
      updates,
      statusHistory
    };
  });
  const updatesByProject = {};
  projectViewModels.forEach(vm => {
    updatesByProject[vm.projectKey] = vm.updates.map(u => u.creationDate).filter(Boolean);
  });
  const timelineViewModel = {
    projects: projectViewModels.map(vm => {
      const latestUpdate = vm.updates.length > 0 ? vm.updates[vm.updates.length - 1] : {};
      return {
        projectKey: vm.projectKey,
        name: vm.name,
        state: latestUpdate.state,
        oldState: latestUpdate.oldState,
        newDueDate: latestUpdate.newDueDate,
        oldDueDate: latestUpdate.oldDueDate,
        missedUpdate: latestUpdate.missedUpdate,
      };
    }),
    updatesByProject
  };
  return { projectViewModels, timelineViewModel };
}

export default function ProjectList({ projects }) {
  // Fetch all updates and status history for all projects
  const allUpdates = useLiveQuery(() => db.projectUpdates.toArray(), []);
  const allStatusHistory = useLiveQuery(() => db.projectStatusHistory.toArray(), []);

  // Build the view model for the list and timeline
  const { projectViewModels, timelineViewModel } = useMemo(
    () => createProjectListViewModel(projects, allUpdates, allStatusHistory),
    [projects, allUpdates, allStatusHistory]
  );

  return (
    <>
      <ProjectTimeline viewModel={timelineViewModel} />
    </>
  );
}
