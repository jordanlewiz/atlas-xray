import React from "react";
import { format } from "date-fns";
import { safeParseDate } from "../utils/timelineUtils";

export default function ProjectTimelineRow({ projectUpdate, weekRanges, updates }) {
  // Only use updates with a valid string creationDate
  const validUpdates = updates.filter(u => u && typeof u.creationDate === 'string');
  console.log("projectUpdate", projectUpdate);
  return (
    <div className="timeline-row">
      <div className="timeline-y-label">
        <a
          href={projectUpdate.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          {projectUpdate.name}
        </a>
        <br />
        <small>{projectUpdate.projectKey}</small>
      </div>
      {weekRanges.map((w, i) => {
        const weekStart = w.start;
        const weekEnd = w.end;
        const weekUpdates = validUpdates.filter(u => {
          const d = safeParseDate(u.creationDate);
          return d && d >= weekStart && d < weekEnd;
        });
        // Get the last update for the week (if any)
        const lastUpdate = weekUpdates.length > 0 ? weekUpdates[weekUpdates.length - 1] : undefined;
        const stateClass = lastUpdate
          ? lastUpdate.missedUpdate
            ? 'state-missed-update'
            : lastUpdate.state
              ? `state-${lastUpdate.state.replace(/_/g, '-').toLowerCase()}`
              : 'state-pending'
          : 'state-none';
        return (
          <div key={i} className={`timeline-cell${weekUpdates.length > 0 ? ' has-update' : ''} ${stateClass}`}>
            {weekUpdates.map((u, idx) => (
              <div key={idx} className={u.oldDueDate ? 'has-old-due-date' : ''}>
                {u.oldDueDate ? u.oldDueDate : ''}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
