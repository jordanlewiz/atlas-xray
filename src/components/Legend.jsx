import React from "react";

export default function Legend() {
  return (
    <div className="timeline-legend">
      <span className="legend-item legend-on-track">On Track</span>
      <span className="legend-item legend-off-track">Off Track</span>
      <span className="legend-item legend-at-risk">At Risk</span>
      <span className="legend-item legend-pending">Pending</span>
      <span className="legend-item legend-paused">Paused</span>
      <span className="legend-item legend-cancelled">Cancelled</span>
      <span className="legend-item legend-done">Done</span>
      <span className="legend-item legend-missed-update">Missed Update</span>
    </div>
  );
}
