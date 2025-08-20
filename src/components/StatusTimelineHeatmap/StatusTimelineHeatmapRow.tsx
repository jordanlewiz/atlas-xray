import React, { useState } from "react";
import Tooltip from "@atlaskit/tooltip";
import Popup from "@atlaskit/popup";
import Button from "@atlaskit/button/new";
import ProjectUpdateModal from "../ProjectUpdateModal";
// Conditionally import QualityIndicator
let QualityIndicator: any = null;
try {
  QualityIndicator = require("../QualityIndicator/QualityIndicator").default;
} catch (error) {
  // QualityIndicator not available in this context
  console.log("QualityIndicator not available in content script context");
}
import { buildProjectUrlFromKey } from "../../utils/timelineUtils";
import {
  getTimelineWeekCells,
  getTargetDateDisplay,
  getDueDateTooltip,
  getDueDateDiff
} from "../../utils/timelineUtils";
// Conditionally import AI functionality
let useUpdateQuality: any = null;
try {
  const hook = require("../../hooks/useUpdateQuality");
  useUpdateQuality = hook.useUpdateQuality;
} catch (error) {
  // AI functionality not available in this context
  console.log("AI functionality not available in content script context");
}
import type { StatusTimelineHeatmapRowProps } from "../../types";

/**
 * Renders a single project row in the status timeline heatmap.
 */
export default function StatusTimelineHeatmapRow({ 
  project, 
  weekRanges, 
  updates 
}: StatusTimelineHeatmapRowProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const updateQualityHook = useUpdateQuality ? useUpdateQuality() : null;
  const getUpdateQuality = updateQualityHook?.getUpdateQuality;
  
  if (!project) {
    console.warn('ProjectTimelineRow received undefined project');
    return null;
  }

  const weekCells = getTimelineWeekCells(weekRanges, updates);
  
  // Get target date from the most recent update that has one
  const targetDateRaw = updates.find(u => u.targetDate)?.targetDate ||
                       updates.find(u => u.newDueDate)?.newDueDate ||
                       null;
  const targetDateDisplay = getTargetDateDisplay(targetDateRaw);

  return (
    <div className="timeline-row">
      <div className="timeline-y-label">
        <Tooltip content={project.name} position="top-start">
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
            <div 
              key={idx} 
              className={`timeline-cell-content ${u.oldDueDate ? 'has-old-due-date' : ''}`}
              onClick={() => setSelectedUpdate(u)}
              style={{ cursor: 'pointer' }}
            >
              {/* Show date difference tooltip if there's a date change */}
              {u.oldDueDate && u.newDueDate && (
                <Tooltip content={getDueDateTooltip(u)} position="top">
                  <span className="date-difference">
                    {(() => {
                      const diff = getDueDateDiff(u);
                      return diff !== null ? (diff > 0 ? `+${diff}` : `${diff}`) : '';
                    })()}
                  </span>
                </Tooltip>
              )}
              
              {/* Show quality indicator if available */}
              {u.id && QualityIndicator && (() => {
                const quality = getUpdateQuality?.(u.id);
                if (quality) {
                  return (
                    <QualityIndicator
                      score={quality.overallScore}
                      level={quality.qualityLevel}
                      size="small"
                      className="quality-indicator-timeline"
                    />
                  );
                }
                return null;
              })()}
              
              {/* Show update indicator for any cell with updates */}
              {!u.oldDueDate && (
                <Tooltip content="Click to view update details" position="top">
                  <span className="update-indicator">•</span>
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
      
      <ProjectUpdateModal
        selectedUpdate={selectedUpdate}
        project={project}
        onClose={() => setSelectedUpdate(null)}
      />
    </div>
  );
}
