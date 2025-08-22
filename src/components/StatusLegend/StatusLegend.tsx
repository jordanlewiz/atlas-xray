import React from "react";

/**
 * Displays the color legend for the timeline statuses.
 */
export default function StatusLegend(): React.JSX.Element {
  return (
    <div className="legend">
      <span className="legend-item legend-on-track">On Track</span>
      <span className="legend-item legend-off-track">Off Track</span>
      <span className="legend-item legend-at-risk">At Risk</span>
      <span className="legend-item legend-pending">Pending</span>
      <span className="legend-item legend-completed">Completed</span>
      <span className="legend-item legend-paused">Paused</span>
      <span className="legend-item legend-cancelled">Cancelled</span>
      <span className="legend-item legend-none">No Status</span>
    </div>
  );
}
