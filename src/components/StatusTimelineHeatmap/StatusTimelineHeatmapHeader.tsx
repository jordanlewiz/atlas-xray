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
    <div className="timeline-header">
      {/* Project info column */}
      <div className="project-info-header">
        <span>Project</span>
      </div>
      
      {/* Week range columns */}
      {weekRanges.map((week, index) => (
        <div key={index} className="week-header">
          <span className="week-label">{week.label}</span>
        </div>
      ))}
      
      {/* Target date column */}
      <div className="target-date-header">
        <span>Target Date</span>
      </div>
      
      {/* Days shift column */}
      <div className="days-shift-header">
        <span>Days Shift</span>
        <div className="header-tooltip">
          <small>Total days between original and most recent target date</small>
        </div>
      </div>
    </div>
  );
}

export default StatusTimelineHeatmapHeader;
