import React from "react";
import ProjectTimelineRow from "./ProjectTimelineRow";
import ProjectTimelineHeader from "./ProjectTimelineHeader";
import { useTimeline } from "../../hooks/useTimelineData";

interface ProjectTimelineProps {
  weekLimit?: number;
}

/**
 * Main project timeline component. Uses the hook directly for data and renders the timeline grid.
 */
export default function ProjectTimeline({ weekLimit = 12 }: ProjectTimelineProps): React.JSX.Element {
  const { projectViewModels, weekRanges, updatesByProject, isLoading } = useTimeline(weekLimit);

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  return (
    <div className="project-timeline">
      <ProjectTimelineHeader weekRanges={weekRanges} />
      {projectViewModels.filter(Boolean).map((project, idx) => (
        <ProjectTimelineRow
          key={project.projectKey || idx}
          project={project}
          weekRanges={weekRanges}
          updates={updatesByProject[project.projectKey] || []}
        />
      ))}
    </div>
  );
}
