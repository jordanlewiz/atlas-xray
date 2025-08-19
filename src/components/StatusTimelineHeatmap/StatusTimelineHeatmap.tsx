import React from "react";
import StatusTimelineHeatmapRow from "./StatusTimelineHeatmapRow";
import StatusTimelineHeatmapHeader from "./StatusTimelineHeatmapHeader";
import { useTimeline } from "../../hooks/useTimelineData";

interface StatusTimelineHeatmapProps {
  weekLimit?: number;
}

/**
 * Main project status timeline heatmap component. Uses the hook directly for data and renders the timeline grid.
 */
export default function StatusTimelineHeatmap({ weekLimit = 12 }: StatusTimelineHeatmapProps): React.JSX.Element {
  const { projectViewModels, weekRanges, updatesByProject, isLoading } = useTimeline(weekLimit);

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  return (
    <div className="project-timeline">
      <StatusTimelineHeatmapHeader weekRanges={weekRanges} />
      {projectViewModels.filter(Boolean).map((project, idx) => (
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
