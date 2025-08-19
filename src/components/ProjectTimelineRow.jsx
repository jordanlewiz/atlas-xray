import React from "react";
import { format } from "date-fns";
import { safeParseDate } from "../utils/timelineUtils";
import { buildProjectUrlFromKey } from "../utils/linkUtils";
import Tooltip from "@atlaskit/tooltip";
import { daysBetweenFlexibleDates } from "../utils/timelineUtils";

/**
 * Renders a single project row in the timeline.
 * @param {Object} props
 * @param {Object} props.project - Project view model
 * @param {Array} props.weekRanges - Array of week range objects
 * @param {Array} props.updates - Array of update objects for this project
 */
export default function ProjectTimelineRow({ project, weekRanges, updates }) {
  if (!project) {
    console.warn('ProjectTimelineRow received undefined project');
    return null;
  }
  // Only use updates with a valid string creationDate
  const validUpdates = updates.filter(u => u && typeof u.creationDate === 'string');
  return (
    <div className="timeline-row">
      <div className="timeline-y-label">
        <Tooltip content={project.name} position="bottom-start">
          <h3 className="project-title-ellipsis">
            {project.name}
          </h3>
        </Tooltip>
        <a
            href={buildProjectUrlFromKey(project.projectKey)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {project.projectKey}
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
                  <Tooltip content={`${u.oldDueDate} → ${u.newDueDate}`}>
                    <span>{daysBetweenFlexibleDates(u.oldDueDate, u.newDueDate)}</span>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        );
      })}
      <div className="timeline-target-date">
        {project.newDueDate || project.targetDate ? (
          <Tooltip content={project.newDueDate || project.targetDate}>
            <span>{(() => {
              const dateStr = project.newDueDate || project.targetDate;
              const d = safeParseDate(dateStr);
              if (d && !isNaN(d.getTime())) {
                return format(d, 'd MMM yyyy');
              }
              return dateStr;
            })()}</span>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}
