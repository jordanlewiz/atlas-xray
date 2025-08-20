import React from "react";
import StatusTimelineHeatmapRow from "./StatusTimelineHeatmapRow";
import StatusTimelineHeatmapHeader from "./StatusTimelineHeatmapHeader";
import { useTimeline } from "../../hooks/useTimelineData";

interface StatusTimelineHeatmapProps {
  weekLimit?: number;
  visibleProjectKeys?: string[];
}

/**
 * Main project status timeline heatmap component. Uses the hook directly for data and renders the timeline grid.
 */
export default function StatusTimelineHeatmap({ weekLimit = 12, visibleProjectKeys }: StatusTimelineHeatmapProps): React.JSX.Element {
  const { projectViewModels, weekRanges, updatesByProject, isLoading } = useTimeline(weekLimit);

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  // Filter projects based on visibleProjectKeys if provided
  const filteredProjects = visibleProjectKeys && visibleProjectKeys.length >= 0
    ? projectViewModels.filter(project => visibleProjectKeys.includes(project.projectKey))
    : projectViewModels;

  return (
    <div className="project-timeline">
      <StatusTimelineHeatmapHeader weekRanges={weekRanges} />
      {filteredProjects.filter(Boolean).map((project, idx) => (
        <StatusTimelineHeatmapRow
          key={project.projectKey || idx}
          project={project}
          weekRanges={weekRanges}
          updates={updatesByProject[project.projectKey] || []}
        />
      ))}
    </div>
  );
}
