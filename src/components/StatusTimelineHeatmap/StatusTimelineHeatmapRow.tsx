import React, { useState, useEffect } from "react";
import Tooltip from "@atlaskit/tooltip";
import Popup from "@atlaskit/popup";
import Button from "@atlaskit/button/new";
import ProjectUpdateModal from "../ProjectUpdateModal";
import QualityIndicator from "../QualityIndicator/QualityIndicator";
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
function StatusTimelineHeatmapRow({ 
  project, 
  weekRanges, 
  updates,
  showEmojis
}: StatusTimelineHeatmapRowProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const updateQualityHook = useUpdateQuality ? useUpdateQuality() : null;
  const getUpdateQuality = updateQualityHook?.getUpdateQuality;
  const updateTrigger = updateQualityHook?.updateTrigger || 0;
  
  // Force re-render when quality data changes
  useEffect(() => {
    // This effect will run whenever updateTrigger changes, forcing a re-render
  }, [updateTrigger]);
  
  if (!project) {
    console.warn('ProjectTimelineRow received undefined project');
    return null;
  }

  const weekCells = getTimelineWeekCells(weekRanges, updates);
  
  // Debug logging

  
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
      
      {weekCells.map((cell: any, i: number) => {

        
        return (
          <div key={i} className={cell.cellClass}>
            {cell.weekUpdates.map((u: any, idx: number) => {
              
              return (
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
              
              {/* Show update indicator for any cell with updates */}
              <Tooltip content="Click to view update details" position="top">
                {showEmojis && u.id ? (
                  // Show quality indicator when toggle is on and quality data is available
                  (() => {
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
                    // Show white bullet when toggle is on but no quality data available
                    return (
                      <span 
                        className="update-indicator" 
                        data-testid="update-indicator"
                        title="Project update"
                      />
                    );
                  })()
                ) : (
                  // Show white bullet when toggle is off
                  <span 
                    className="update-indicator" 
                    data-testid="update-indicator"
                    title="Project update"
                  />
                )}
              </Tooltip>
            </div>
          );
        })}
        </div>
      );
      })}
      
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

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(StatusTimelineHeatmapRow);
