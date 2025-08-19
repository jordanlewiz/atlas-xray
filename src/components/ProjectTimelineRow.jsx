import React, { useState } from "react";
import Tooltip from "@atlaskit/tooltip";
import Popup from "@atlaskit/popup";
import Button from "@atlaskit/button/new";
import DateChangeModal from "./DateChangeModal.jsx";
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
    console.log("selectedUpdate >>", updates);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  
  if (!project) {
    console.warn('ProjectTimelineRow received undefined project');
    return null;
  }
  console.log('ProjectTimelineRow render:', { 
    projectKey: project.projectKey,
    weekRangesCount: weekRanges?.length,
    updatesCount: updates?.length,
    weekRanges,
    updates
  });
  
  const weekCells = getTimelineWeekCells(weekRanges, updates);
  console.log('weekCells result:', weekCells);
  
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
            <div key={idx} className={u.oldDueDate ? 'has-old-due-date' : ''} onClick={() => setSelectedUpdate(u)}>
              {u.oldDueDate && u.newDueDate && (
                <Tooltip content={getDueDateTooltip(u)} position="top">
                    {getDueDateDiff(u)}
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
              appearance="default"
              spacing="compact"
              onClick={() => setIsOpen(!isOpen)}
            >
              {targetDateRaw}
            </Button>
          )}
          placement="bottom-start"
          zIndex={1000}
        />
      </div>
      
      <DateChangeModal
        selectedUpdate={selectedUpdate}
        project={project}
        onClose={() => setSelectedUpdate(null)}
      />
    </div>
  );
}
