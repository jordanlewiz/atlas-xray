import React, { useState } from "react";
import Tooltip from "@atlaskit/tooltip";
import Popup from "@atlaskit/popup";
import Button from "@atlaskit/button/new";
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
  const [isOpen, setIsOpen] = useState(false);
  
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
                <Tooltip content={getDueDateTooltip(u)} position="top">
                  <Popup
                    trigger={(triggerProps) => (
                      <span 
                        {...triggerProps} 
                        style={{ cursor: 'pointer', padding: '2px' }}
                      >
                        {getDueDateDiff(u)}
                      </span>
                    )}
                    content={() => (
                      <div style={{ padding: '8px', maxWidth: '300px' }}>
                        <strong>Date Change</strong>
                        <br />
                        <span style={{ color: 'red' }}>{u.oldDueDate}</span> → <span style={{ color: 'green' }}>{u.newDueDate}</span>
                        <br />
                        <small>Difference: {getDueDateDiff(u)} days</small>
                        {u.summary && (
                          <>
                            <br />
                            <br />
                            <strong>Summary:</strong>
                            <br />
                            {u.summary}
                          </>
                        )}
                      </div>
                    )}
                    placement="top"
                  />
                </Tooltip>
              )}
            </div>
          ))}
        </div>
      ))}
      <div className="timeline-target-date">        
        <Popup
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          content={() => (
            <div style={{ padding: '16px', maxWidth: '300px' }}>
              <h3>Target Date</h3>
              <p>{targetDateRaw}</p>
            </div>
          )}
          trigger={(triggerProps) => (
            <Button
              {...triggerProps}
              appearance="primary"
              onClick={() => setIsOpen(!isOpen)}
            >
              {targetDateRaw}
            </Button>
          )}
          placement="bottom-start"
          zIndex={1000}
        />
      </div>
    </div>
  );
}
