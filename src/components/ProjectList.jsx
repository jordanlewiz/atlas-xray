import React from "react";
import ProjectTimeline from "./ProjectTimeline.jsx";
import { useTimelineContext } from "../contexts/TimelineContext";

/**
 * Main project list component. Now uses context instead of props for data.
 */
export default function ProjectList() {
  const { projectViewModels, isLoading } = useTimelineContext();

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  return (
    <>
      <ProjectTimeline projects={projectViewModels} />
    </>
  );
}
