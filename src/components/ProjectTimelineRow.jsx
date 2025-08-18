import React from "react";
import { format } from "date-fns";
import { safeParseDate } from "../utils/timelineUtils";
import { buildProjectUrlFromKey } from "../utils/linkUtils";
import { daysBetweenFlexibleDates } from "../utils/timelineUtils";

export default function ProjectTimelineRow({ project, weekRanges, updates }) {
  // Only use updates with a valid string creationDate
  const validUpdates = updates.filter(u => u && typeof u.creationDate === 'string');
  return (
    console.log("project", project),
    <div className="timeline-row">
      <div className="timeline-y-label">
      {project.name}<br />
        <a
          href={buildProjectUrlFromKey(project.projectKey)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          <small>{project.projectKey}</small>
        </a>
        
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
        // Determine the state class for the cell
        let stateClass = 'state-none';
        if (lastUpdate) {
          if (lastUpdate.missedUpdate) {
            stateClass = 'state-missed-update';
          } else if (lastUpdate.state) {
            stateClass = `state-${lastUpdate.state.replace(/_/g, '-').toLowerCase()}`;
          }
        }
        // Determine the oldState class for the cell
        let oldStateClass = '';
        if (lastUpdate && lastUpdate.oldState) {
          oldStateClass = `old-state-${lastUpdate.oldState.replace(/_/g, '-').toLowerCase()}`;
        }
        // Compose the full class string
        const cellClass = [
          'timeline-cell',
          weekUpdates.length > 0 ? 'has-update' : '',
          stateClass,
          oldStateClass
        ].filter(Boolean).join(' ');
        return (
          <div key={i} className={cellClass}>
            {weekUpdates.map((u, idx) => (
              <div key={idx} className={u.oldDueDate ? 'has-old-due-date' : ''}>
                {u.oldDueDate && u.newDueDate && (
                  <span>{daysBetweenFlexibleDates(u.oldDueDate, u.newDueDate)}</span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
