import React, { useState, useMemo } from "react";
import StatusTimelineHeatmapRow from "./StatusTimelineHeatmapRow";
import StatusTimelineHeatmapHeader from "./StatusTimelineHeatmapHeader";
import StatusTimelineHeader from "./StatusTimelineHeader";
import { useTimeline } from "../../hooks/useTimelineData";

interface StatusTimelineHeatmapProps {
  weekLimit?: number;
  visibleProjectKeys?: string[];
}

/**
 * Main project status timeline heatmap component. Uses the hook directly for data and renders the timeline grid.
 */
function StatusTimelineHeatmap({ weekLimit: initialWeekLimit = 12, visibleProjectKeys }: StatusTimelineHeatmapProps): React.JSX.Element {
  const [weekLimit, setWeekLimit] = useState(initialWeekLimit);
  const [showEmojis, setShowEmojis] = useState(true); // Default to quality indicators
  const { projectViewModels, weekRanges, updatesByProject, isLoading } = useTimeline(weekLimit);

  // Memoize filtered projects to prevent unnecessary recalculations
  const filteredProjects = useMemo(() => {
    // If visibleProjectKeys is not provided, show all projects
    if (!visibleProjectKeys) {
      return projectViewModels;
    }
    // If visibleProjectKeys is an empty array, show no projects
    if (visibleProjectKeys.length === 0) {
      return [];
    }
    // Filter projects based on visibleProjectKeys
    return projectViewModels.filter(project => visibleProjectKeys.includes(project.projectKey));
  }, [projectViewModels, visibleProjectKeys]);

  const handleWeekLimitChange = (newWeekLimit: number) => {
    setWeekLimit(newWeekLimit);
  };

  const handleToggleEmojis = (newShowEmojis: boolean) => {
    setShowEmojis(newShowEmojis);
  };

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  if (!filteredProjects || filteredProjects.length === 0) {
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
      {filteredProjects.filter(Boolean).map((project, idx) => (
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
