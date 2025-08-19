import React from "react";
import ProjectTimeline from "./ProjectTimeline";
import { useTimeline } from "../hooks/useTimelineData";

/**
 * Main project list component. Now uses the hook directly for data.
 */
export default function ProjectList({ weekLimit = 12 }) {
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
