import React from "react";
import ProjectTimeline from "./timeline/ProjectTimeline";
import { useTimeline } from "../hooks/useTimelineData";

interface ProjectListProps {
  weekLimit?: number;
}

/**
 * Main project list component. Uses the hook directly for data.
 */
export default function ProjectList({ weekLimit = 12 }: ProjectListProps): React.JSX.Element {
  const { projectViewModels, weekRanges, updatesByProject, isLoading } = useTimeline(weekLimit);

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  return (
    <>
      <ProjectTimeline 
        projects={projectViewModels} 
        weekRanges={weekRanges}
        updatesByProject={updatesByProject}
      />
    </>
  );
}
