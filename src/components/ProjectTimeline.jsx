import React from "react";
import { getWeekRanges, getAllProjectDates } from "../utils/timelineUtils";
import ProjectTimelineRow from "./ProjectTimelineRow.jsx";

/**
 * ProjectTimeline view model is passed as the viewModel prop.
 * Contains: { projects, updatesByProject }
 */
const ProjectTimeline = ({ viewModel }) => {
  const { projects, updatesByProject } = viewModel;
  const { minDate, maxDate } = getAllProjectDates(projects, updatesByProject);
  if (!minDate || !maxDate) return null;
  const weekRanges = getWeekRanges(minDate, maxDate);

  return (
    <div className="project-timeline">
      <div className="timeline-row timeline-labels">
        <div className="timeline-y-label" />
        {weekRanges.map((w, i) => (
          <div key={i} className="timeline-x-label">{w.label}</div>
        ))}
      </div>
      {projects.map((proj, idx) => (
        <ProjectTimelineRow
          key={proj.projectKey || idx}
          project={proj}
          weekRanges={weekRanges}
          updates={updatesByProject[proj.projectKey] || []}
        />
      ))}
    </div>
  );
};

export default ProjectTimeline;