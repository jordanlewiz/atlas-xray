import React from "react";
import ProjectTimelineRow from "./ProjectTimelineRow";
import ProjectTimelineHeader from "./ProjectTimelineHeader";
import { useTimelineContext } from "../contexts/TimelineContext";
import type { ProjectTimelineProps } from "../types";

/**
 * Renders the project timeline grid. Now uses context for data.
 */
const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects }) => {
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
