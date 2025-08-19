import React from "react";
import ProjectTimelineRow from "./ProjectTimelineRow";
import ProjectTimelineHeader from "./ProjectTimelineHeader";
import type { ProjectTimelineProps } from "../../types";


/**
 * Renders the project timeline grid. Receives data as props.
 */
const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
  projects, 
  weekRanges, 
  updatesByProject 
}) => {
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
