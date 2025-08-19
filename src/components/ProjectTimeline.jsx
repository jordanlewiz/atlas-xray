import React from "react";
import { getWeekRanges, getAllProjectDates } from "../utils/timelineUtils";
import ProjectTimelineRow from "./ProjectTimelineRow.jsx";
import ProjectTimelineHeader from "./ProjectTimelineHeader.jsx";

/**
 * Renders the project timeline grid.
 * @param {Object} props
 * @param {Object} props.viewModel - Contains { projects, updatesByProject }
 * @param {number} props.weekLimit - Number of weeks to display
 */
const ProjectTimeline = ({ viewModel, weekLimit }) => {
  const { projects, updatesByProject } = viewModel;
  const { minDate, maxDate } = getAllProjectDates(projects, updatesByProject);
  if (!minDate || !maxDate) return null;
  const weekRanges = getWeekRanges(minDate, maxDate);
  const limitedWeekRanges =
    typeof weekLimit === 'number' && isFinite(weekLimit)
      ? weekRanges.slice(-weekLimit)
      : weekRanges;

  return (
    <div className="project-timeline">
      <ProjectTimelineHeader weekRanges={limitedWeekRanges} />
      {projects.filter(Boolean).map((project, idx) => (
        <ProjectTimelineRow
          key={project.projectKey || idx}
          project={project}
          weekRanges={limitedWeekRanges}
          updates={updatesByProject[project.projectKey] || []}
        />
      ))}
    </div>
  );
};

export default ProjectTimeline;