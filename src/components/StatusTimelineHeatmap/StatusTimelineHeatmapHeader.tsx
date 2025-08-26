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
      
      {/* Target date column */}
      <div className="timeline-target-date">
        <span>Target Date</span>
      </div>
      
      {/* Days shift column */}
      <div className="timeline-days-shift">
        <span>Days Shift</span>
        <div className="header-tooltip">
          <small>Total days between original and most recent target date</small>
        </div>
      </div>
    </div>
  );
}

export default StatusTimelineHeatmapHeader;
