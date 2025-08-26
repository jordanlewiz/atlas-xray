import React, { useState, useEffect, useMemo } from "react";
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
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/DatabaseService';
// Quality analysis data is now stored directly in update objects by ProjectPipeline
import type { StatusTimelineHeatmapRowProps } from "../../types";

/**
 * Component to display project dependencies in the timeline row
 */
function DependenciesDisplay({ projectKey }: { projectKey: string }) {
  const dependencies = useLiveQuery(() => db.getProjectDependencies(projectKey));
  const dependents = useLiveQuery(() => db.getProjectsDependingOn(projectKey));

  if (!dependencies || !dependents) return null;

  const hasDependencies = dependencies.length > 0;
  const hasDependents = dependents.length > 0;

  if (!hasDependencies && !hasDependents) return null;

  return (
    <div className="dependencies-display">
      {hasDependencies && (
        <Tooltip
          content={
            <div>
              <strong>{dependencies.length} dependencies:</strong>
              <br />
              {dependencies.map(d => `${d.targetProjectKey} (${d.linkType})`).join(', ')}
            </div>
          }
          position="top"
        >
          <span className="dependency-indicator outgoing">
            {dependencies.length}→
          </span>
        </Tooltip>
      )}
      {hasDependents && (
        <Tooltip
          content={
            <div>
              <strong>{dependents.length} dependents:</strong>
              <br />
              {dependents.map(d => `${d.sourceProjectKey} (${d.linkType})`).join(', ')}
            </div>
          }
          position="top"
        >
          <span className="dependency-indicator incoming">
            ←{dependents.length}
          </span>
        </Tooltip>
      )}
    </div>
  );
}

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
  // Quality data is now stored directly in the update objects by ProjectPipeline
  // No need for external hooks or triggers
  
  if (!project) {
    console.warn('ProjectTimelineRow received undefined project');
    return null;
  }

  const weekCells = getTimelineWeekCells(weekRanges, updates);
  
  // Debug logging
  console.log(`[StatusTimelineHeatmapRow] 🔍 ${project.projectKey} weekCells:`, {
    projectKey: project.projectKey,
    weekCellsCount: weekCells.length,
    sampleCell: weekCells[0],
    updatesCount: updates.length
  });

  
  // Get target date from the most recent update that has one
  const targetDateRaw = updates.find(u => u.targetDate)?.targetDate ||
                       updates.find(u => u.newDueDate)?.newDueDate ||
                       null;
  const targetDateDisplay = getTargetDateDisplay(targetDateRaw);

  // Calculate days shift between original and most recent target date
  const daysShift = useMemo(() => {
    if (!updates || updates.length === 0) return null;

    // Find the earliest target date (original)
    const originalTargetDate = updates
      .filter(u => u.oldDueDate || u.targetDate)
      .sort((a, b) => {
        const dateA = a.oldDueDate || a.targetDate || '';
        const dateB = b.oldDueDate || b.targetDate || '';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      })[0]?.oldDueDate || updates[0]?.targetDate;

    // Find the most recent target date
    const recentTargetDate = updates
      .filter(u => u.newDueDate || u.targetDate)
      .sort((a, b) => {
        const dateA = a.newDueDate || a.targetDate || '';
        const dateB = b.newDueDate || b.targetDate || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })[0]?.newDueDate || updates[0]?.targetDate;

    if (!originalTargetDate || !recentTargetDate) return null;

    try {
      const original = new Date(originalTargetDate);
      const recent = new Date(recentTargetDate);
      
      if (isNaN(original.getTime()) || isNaN(recent.getTime())) return null;

      const diffTime = recent.getTime() - original.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('[StatusTimelineHeatmapRow] Error calculating days shift:', error);
      return null;
    }
  }, [updates]);

  return (
    <div className="timeline-row" data-testid="project-row">
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
        <DependenciesDisplay projectKey={project.projectKey} />
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
              {/* Show update indicator for any cell with updates FIRST */}
              <Tooltip content="Click to view update details" position="top">
                {showEmojis && u.uuid ? (
                  // Show quality indicator when toggle is on
                  (() => {
                    // Check if analysis is complete
                    if (u.updateQuality !== undefined && u.qualityLevel) {
                      return (
                        <QualityIndicator
                          score={u.updateQuality}
                          level={u.qualityLevel}
                          size="small"
                          className="quality-indicator-timeline"
                        />
                      );
                    }
                    // Show pending analysis indicator when toggle is on but analysis not complete
                    return (
                      <span 
                        className="update-indicator pending-analysis" 
                        data-testid="update-indicator-pending"
                        title="Analysis in progress..."
                        style={{
                          backgroundColor: '#ffab00',
                          animation: 'pulse 2s infinite'
                        }}
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
              
              {/* Show date difference tooltip SECOND (after emoji) */}
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
      
      {/* Days Shift Column */}
      <div className="timeline-days-shift">
        {daysShift !== null ? (
          <Tooltip content={`${daysShift > 0 ? '+' : ''}${daysShift} days from original target date`} position="top">
            <span className={`days-shift-value ${daysShift > 0 ? 'positive' : daysShift < 0 ? 'negative' : 'neutral'}`}>
              {daysShift > 0 ? `+${daysShift}` : daysShift}
            </span>
          </Tooltip>
        ) : (
          <span style={{ color: '#6b7280', fontSize: '12px' }}>N/A</span>
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
