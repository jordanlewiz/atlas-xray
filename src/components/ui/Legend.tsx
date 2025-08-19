import React from "react";

/**
 * Displays the color legend for the timeline statuses.
 */
export default function Legend(): React.JSX.Element {
  return (
    <div className="legend">
      <span className="legend-item legend-completed">Completed</span>
      <span className="legend-item legend-in-progress">In Progress</span>
      <span className="legend-item legend-pending">Pending</span>
      <span className="legend-item legend-paused">Paused</span>
      <span className="legend-item legend-cancelled">Cancelled</span>
      <span className="legend-item legend-missed-update">Missed Update</span>
      <span className="legend-item legend-none">No Status</span>
    </div>
  );
}
