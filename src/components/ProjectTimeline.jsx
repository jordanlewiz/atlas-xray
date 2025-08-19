import React from "react";
import { getWeekRanges, getAllProjectDates } from "../utils/timelineUtils";
import ProjectTimelineRow from "./ProjectTimelineRow.jsx";
import Tooltip from "@atlaskit/tooltip";

/**
 * ProjectTimeline view model is passed as the viewModel prop.
 * Contains: { projects, updatesByProject }
 * Accepts weekLimit prop to limit the number of weeks shown.
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
      <div className="timeline-row timeline-labels">
        <div className="timeline-y-label" />
        {limitedWeekRanges.map((w, i) => (
          <div key={i} className="timeline-x-label">
            <Tooltip content={w.label}>{w.label}</Tooltip>
          </div>
        ))}
      </div>
      {projects.filter(Boolean).map((proj, idx) => (
        <ProjectTimelineRow
          key={proj.projectKey || idx}
          projectUpdate={proj}
          weekRanges={limitedWeekRanges}
          updates={updatesByProject[proj.projectKey] || []}
        />
      ))}
    </div>
  );
};

export default ProjectTimeline;