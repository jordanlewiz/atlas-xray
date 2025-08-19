import React from "react";
import ProjectTimelineRow from "./ProjectTimelineRow.jsx";
import ProjectTimelineHeader from "./ProjectTimelineHeader.jsx";
import { useTimelineContext } from "../contexts/TimelineContext";

/**
 * Renders the project timeline grid. Now uses context for data.
 */
const ProjectTimeline = ({ projects }) => {
  const { weekRanges, updatesByProject } = useTimelineContext();

  console.log('ProjectTimeline render:', { 
    projectsCount: projects?.length, 
    weekRangesCount: weekRanges?.length,
    weekRanges,
    updatesByProjectKeys: Object.keys(updatesByProject || {})
  });

  return (
    <div className="project-timeline">
      <ProjectTimelineHeader weekRanges={weekRanges} />
      {projects.filter(Boolean).map((project, idx) => (
        <ProjectTimelineRow
          key={project.projectKey || idx}
          project={project}
          weekRanges={weekRanges}
          updates={updatesByProject[project.projectKey] || []}
        />
      ))}
    </div>
  );
};

export default ProjectTimeline;