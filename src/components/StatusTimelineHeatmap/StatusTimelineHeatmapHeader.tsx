import React from "react";
import Tooltip from "@atlaskit/tooltip";
import type { ProjectTimelineHeaderProps } from "../../types";

/**
 * Renders the header row of the status timeline heatmap with week labels.
 */
export default function StatusTimelineHeatmapHeader({ weekRanges }: StatusTimelineHeatmapHeaderProps): React.JSX.Element {
  return (
    <div className="timeline-row timeline-labels">
      <div className="timeline-y-label" /> {/* Empty cell for project names */}
      {weekRanges.map((w, i) => (
        <div key={i} className="timeline-x-label">
          <Tooltip content={w.label}>{w.label}</Tooltip>
        </div>
      ))}
      <div className="timeline-target-date">Target Date</div> {/* Label for target date column */}
    </div>
  );
}
