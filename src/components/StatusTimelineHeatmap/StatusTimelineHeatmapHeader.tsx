import React from "react";
import Tooltip from "@atlaskit/tooltip";
import type { WeekRange } from "../../types";

interface StatusTimelineHeatmapHeaderProps {
  weekRanges: WeekRange[];
}

/**
 * Header row for the timeline heatmap showing week ranges
 */
function StatusTimelineHeatmapHeader({ weekRanges }: StatusTimelineHeatmapHeaderProps): React.JSX.Element {
  return (
    <div className="timeline-row timeline-labels">
      {/* Project info column */}
      <div className="timeline-y-label">
        <span>Project</span>
      </div>
      
      {/* Week range columns */}
      {weekRanges.map((week, index) => (
        <div key={index} className="timeline-x-label">
          <div>{week.label}</div>
        </div>
      ))}
      
      {/* Latest due date column */}
      <div className="timeline-target-date">
        <span>Latest Due Date</span>
      </div>
      
      {/* Date range days column */}
      <div className="timeline-days-shift">
        <span>Date Range Days</span>
      </div>
    </div>
  );
}

export default StatusTimelineHeatmapHeader;
