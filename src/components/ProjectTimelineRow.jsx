import React from "react";
import Tooltip from "@atlaskit/tooltip";
import { buildProjectUrlFromKey } from "../utils/linkUtils";
import {
  getTimelineWeekCells,
  getTargetDateDisplay,
  getDueDateTooltip,
  getDueDateDiff
} from "../utils/timelineViewModels";

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
  const weekCells = getTimelineWeekCells(weekRanges, updates);
  const targetDateRaw = project.newDueDate || project.targetDate;
  const targetDateDisplay = getTargetDateDisplay(targetDateRaw);

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
      {weekCells.map((cell, i) => (
        <div key={i} className={cell.cellClass}>
          {cell.weekUpdates.map((u, idx) => (
            <div key={idx} className={u.oldDueDate ? 'has-old-due-date' : ''}>
              {u.oldDueDate && u.newDueDate && (
                <Tooltip content={getDueDateTooltip(u)}>
                  <span>{getDueDateDiff(u)}</span>
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      ))}
      <div className="timeline-target-date">
        {targetDateRaw ? (
          <Tooltip content={targetDateRaw}>
            <span>{targetDateDisplay}</span>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}
