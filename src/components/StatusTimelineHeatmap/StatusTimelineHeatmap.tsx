import React, { useState, useMemo } from "react";
import StatusTimelineHeatmapRow from "./StatusTimelineHeatmapRow";
import StatusTimelineHeatmapHeader from "./StatusTimelineHeatmapHeader";
import StatusTimelineHeader from "./StatusTimelineHeader";
import { useTimeline } from "../../hooks/useTimelineData";
import type { ProjectViewModel } from "../../types";

interface StatusTimelineHeatmapProps {
  weekLimit?: number;
  visibleProjectKeys?: string[];
}

/**
 * Main project status timeline heatmap component. Uses the hook directly for data and renders the timeline grid.
 */
function StatusTimelineHeatmap({ weekLimit: initialWeekLimit = 12, visibleProjectKeys }: StatusTimelineHeatmapProps): React.JSX.Element {
  const [weekLimit, setWeekLimit] = useState(initialWeekLimit);
  const [showEmojis, setShowEmojis] = useState(false); // Default to off (no quality indicators)
  const { projectViewModels, weekRanges, updatesByProject, isLoading } = useTimeline(weekLimit);

  // No need for additional filtering - useTimeline already handles projectList filtering
  const projectsToShow = projectViewModels || [];

  const handleWeekLimitChange = (newWeekLimit: number) => {
    setWeekLimit(newWeekLimit);
  };

  const handleToggleEmojis = (newShowEmojis: boolean) => {
    setShowEmojis(newShowEmojis);
  };

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  if (!projectsToShow || projectsToShow.length === 0) {
    return (
      <div className="project-timeline">
        <StatusTimelineHeader
          weekLimit={weekLimit}
          onWeekLimitChange={handleWeekLimitChange}
          showEmojis={showEmojis}
          onToggleEmojis={handleToggleEmojis}
        />
        <div className="empty-state">
          <p>No projects found for the selected criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-timeline">
      <StatusTimelineHeader
        weekLimit={weekLimit}
        onWeekLimitChange={handleWeekLimitChange}
        showEmojis={showEmojis}
        onToggleEmojis={handleToggleEmojis}
      />
      <StatusTimelineHeatmapHeader weekRanges={weekRanges} />
      {projectsToShow.filter(Boolean).map((project, idx) => (
        <StatusTimelineHeatmapRow
          key={project.projectKey || idx}
          project={project}
          weekRanges={weekRanges}
          updates={updatesByProject[project.projectKey] || []}
          showEmojis={showEmojis}
        />
      ))}
    </div>
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(StatusTimelineHeatmap);
