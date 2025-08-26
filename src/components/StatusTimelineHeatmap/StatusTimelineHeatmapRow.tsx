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

  if (!dependencies) return null;

  // Categorize dependencies by relationship type from the dependencies array only
  const dependsOnCount = dependencies.filter(d => d.linkType === 'DEPENDS_ON').length;
  const relatedCount = dependencies.filter(d => d.linkType === 'RELATED').length;
  const dependedByCount = dependencies.filter(d => d.linkType === 'DEPENDED_BY').length;

  const hasAnyDependencies = dependsOnCount > 0 || relatedCount > 0 || dependedByCount > 0;

  if (!hasAnyDependencies) return null;

  return (
    <div className="dependencies-display">
      {/* Depends On (outgoing dependencies) */}
      {dependsOnCount > 0 && (
        <Tooltip
          content={
            <div style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
              <strong>{dependsOnCount} Depends On:</strong>
              <br />
              {dependencies
                .filter(d => d.linkType === 'DEPENDS_ON')
                .map(d => d.targetProjectKey)
                .join(', ')}
            </div>
          }
          position="top"
        >
          <span className="dependency-indicator depends-on">
            {dependsOnCount}→
          </span>
        </Tooltip>
      )}

      {/* Related projects (related but no dependency) */}
      {relatedCount > 0 && (
        <Tooltip
          content={
            <div style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
              <strong>{relatedCount} Related (no dependency)</strong>
              <br />
              {dependencies
                .filter(d => d.linkType === 'RELATED')
                .map(d => d.targetProjectKey)
                .join(', ')}
            </div>
          }
          position="top"
        >
          <span className="dependency-indicator related">
            {relatedCount}~
          </span>
        </Tooltip>
      )}

      {/* Depended By (incoming dependencies) */}
      {dependedByCount > 0 && (
        <Tooltip
          content={
            <div style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
              <strong>{dependedByCount} Depended By:</strong>
              <br />
              {dependencies
                .filter(d => d.linkType === 'DEPENDED_BY')
                .map(d => d.targetProjectKey)
                .join(', ')}
            </div>
          }
          position="top"
        >
          <span className="dependency-indicator depended-by">
            ←{dependedByCount}
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
  
  // Get target date from the most recent update that has one
  const targetDateRaw = updates.find(u => u.targetDate)?.targetDate ||
                       updates.find(u => u.newDueDate)?.newDueDate ||
                       null;
  const targetDateDisplay = getTargetDateDisplay(targetDateRaw);

  // Calculate days shift between first and latest project update newDueDate
  const daysShift = useMemo(() => {
    if (!updates || updates.length === 0) return null;

    // Sort updates by creation date to get chronological order
    const sortedUpdates = [...updates].sort((a, b) => 
      new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
    );

    // Get first update's newDueDate
    const firstUpdate = sortedUpdates[0];
    const firstDueDate = firstUpdate?.newDueDate;
    
    // Get latest update's newDueDate
    const latestUpdate = sortedUpdates[sortedUpdates.length - 1];
    const latestDueDate = latestUpdate?.newDueDate;

    // Check if first update has newDueDate set
    if (!firstDueDate) {
      console.warn(`[StatusTimelineHeatmapRow] First update for ${project.projectKey} doesn't have newDueDate set yet`);
      return null;
    }

    if (!latestDueDate) {
      console.warn(`[StatusTimelineHeatmapRow] Latest update for ${project.projectKey} doesn't have newDueDate set yet`);
      return null;
    }

    try {
      const first = new Date(firstDueDate);
      const latest = new Date(latestDueDate);
      
      if (isNaN(first.getTime()) || isNaN(latest.getTime())) return null;

      const diffTime = latest.getTime() - first.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('[StatusTimelineHeatmapRow] Error calculating days shift:', error);
      return null;
    }
  }, [updates, project.projectKey]);

  return (
    <div className="timeline-row" data-testid="project-row">
      <div className="timeline-y-label">
        <Tooltip content={project.name} position="top-start">
          <h3 className="project-title-ellipsis">
            {project.name}
          </h3>
        </Tooltip>
        <div className="project-info-group">
          <a
            href={buildProjectUrlFromKey(project.projectKey)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {project.projectKey}
          </a>
          <DependenciesDisplay projectKey={project.projectKey} />
        </div>
      </div>
      
      {weekCells.map((cell: any, i: number) => {

        
        return (
          <div key={i} className={cell.cellClass}>
            {cell.weekUpdates.map((u: any, idx: number) => {
              // Check if this update has a missed update
              const hasMissedUpdate = u.raw?.missedUpdate || u.missedUpdate;
              
              return (
                <div 
                  key={idx} 
                  className={`timeline-cell-content ${u.oldDueDate ? 'has-old-due-date' : ''}`}
                  onClick={hasMissedUpdate ? undefined : () => setSelectedUpdate(u)}
                  style={{ cursor: hasMissedUpdate ? 'default' : 'pointer' }}
                >
                             {/* Show date difference FIRST (replaces bullet when date changed) */}
               {!hasMissedUpdate && u.oldDueDate && u.newDueDate ? (
                 <Tooltip content={getDueDateTooltip(u)} position="top">
                   <span className={`date-difference ${(() => {
                     const diff = getDueDateDiff(u);
                     if (diff === null) return '';
                     if (diff > 0) return 'positive';
                     if (diff < 0) return 'negative';
                     return 'neutral';
                   })()}`}>
                     {(() => {
                       const diff = getDueDateDiff(u);
                       return diff !== null ? (diff > 0 ? `+${diff}` : `${diff}`) : '';
                     })()}
                   </span>
                 </Tooltip>
               ) : (
                 /* Show normal update indicator (quality indicator or bullet) when no date change */
                 !hasMissedUpdate && (
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
                 )
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
          <Tooltip content={`${daysShift > 0 ? '+' : ''}${daysShift} days from first update's due date`} position="top">
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
