import React, { useState } from "react";
import Tooltip from "@atlaskit/tooltip";
import Popup from "@atlaskit/popup";
import Button from "@atlaskit/button/new";
import DateChangeModal from "../ui/DateChangeModal";
import { buildProjectUrlFromKey } from "../../utils/linkUtils";
import {
  getTimelineWeekCells,
  getTargetDateDisplay,
  getDueDateTooltip,
  getDueDateDiff
} from "../../utils/timelineViewModels";
import type { ProjectTimelineRowProps } from "../../types";

/**
 * Renders a single project row in the timeline.
 */
export default function ProjectTimelineRow({ 
  project, 
  weekRanges, 
  updates 
}: ProjectTimelineRowProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  
  if (!project) {
    console.warn('ProjectTimelineRow received undefined project');
    return null;
  }

  const weekCells = getTimelineWeekCells(weekRanges, updates);
  
  // Get target date from the most recent update that has one
  // Based on console logs, look for newTargetDate, targetDate, newDueDate
  const targetDateRaw = updates.find(u => u.newTargetDate)?.newTargetDate ||
                       updates.find(u => u.targetDate)?.targetDate ||
                       updates.find(u => u.newDueDate)?.newDueDate ||
                       null;
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
      
      {weekCells.map((cell: any, i: number) => (
        <div key={i} className={cell.cellClass}>
          {cell.weekUpdates.map((u: any, idx: number) => (
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
        {targetDateRaw ? (
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
                {targetDateDisplay}
              </Button>
            )}
            placement="bottom-start"
            zIndex={1000}
          />
        ) : (
          <span style={{ color: '#6b7280', fontSize: '12px' }}>No target date</span>
        )}
      </div>
      
      <DateChangeModal
        selectedUpdate={selectedUpdate}
        project={project}
        onClose={() => setSelectedUpdate(null)}
      />
    </div>
  );
}
