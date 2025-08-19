import React from "react";
import Tooltip from "@atlaskit/tooltip";

/**
 * Renders the header row for the project timeline.
 * @param {Object} props
 * @param {Array} props.weekRanges - Array of week range objects with .label
 */
export default function ProjectTimelineHeader({ weekRanges }) {
  return (
    <div className="timeline-row timeline-labels">
      <div className="timeline-y-label" />
      {weekRanges.map((w, i) => (
        <div key={i} className="timeline-x-label">
          <Tooltip content={w.label}>{w.label}</Tooltip>
        </div>
      ))}
      <div className="timeline-target-date timeline-target-date-header">Target Date</div>
    </div>
  );
}
