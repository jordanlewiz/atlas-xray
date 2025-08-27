import React, { useState, useEffect, useMemo } from "react";
import Tooltip from "@atlaskit/tooltip";

import ProjectUpdateModal from "../ProjectUpdateModal";
import { DateDifference } from "../DateDifference";
import { UpdateCellContent } from "../UpdateCellContent";
import { buildProjectUrlFromKey } from "../../utils/timelineUtils";
import {
  getTimelineWeekCells,
  getTargetDateDisplay,
  getDueDateDiff,
  parseFlexibleDateChrono,
  normalizeDateForDisplay,
  daysBetweenFlexibleDates
} from "../../utils/timelineUtils";
import { analyzeUpdateCell } from "../../utils/updateCellUtils";
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

  const [selectedUpdate, setSelectedUpdate] = useState(null);
  // Quality data is now stored directly in the update objects by ProjectPipeline
  // No need for external hooks or triggers
  
  if (!project) {
    console.warn('ProjectTimelineRow received undefined project');
    return null;
  }

  const weekCells = getTimelineWeekCells(weekRanges, updates);
  
  // Get latest newDueDate from all updates
  const latestDueDate = updates
    .filter(u => u.newDueDate)
    .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0]?.newDueDate ||
    null;
  // For Target Date column, show the original text (e.g., "October-December 2025"), not parsed date
  const targetDateDisplay = latestDueDate || null;

  // Calculate days shift between first update's oldDueDate and latest update's newDueDate
  const daysShift = useMemo(() => {
    if (!updates || updates.length === 0) return null;

    // Sort updates by creation date to get chronological order
    const sortedUpdates = [...updates].sort((a, b) => 
      new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
    );

    // Get first update's oldDueDate
    const firstUpdate = sortedUpdates[0];
    const firstOldDueDate = firstUpdate?.oldDueDate;
    
    // Get latest update's newDueDate
    const latestUpdate = sortedUpdates[sortedUpdates.length - 1];
    const latestNewDueDate = latestUpdate?.newDueDate;

    // Check if first update has oldDueDate set
    if (!firstOldDueDate) {
      console.warn(`[StatusTimelineHeatmapRow] First update for ${project.projectKey} doesn't have oldDueDate set yet`);
      return null;
    }

    if (!latestNewDueDate) {
      console.warn(`[StatusTimelineHeatmapRow] Latest update for ${project.projectKey} doesn't have newDueDate set yet`);
      return null;
    }

    try {
      // Use the same calculation method as DateDifference component
      const currentYear = new Date().getFullYear();
      const diffDays = daysBetweenFlexibleDates(firstOldDueDate, latestNewDueDate, currentYear);
      
      if (diffDays === null) {
        console.warn(`[StatusTimelineHeatmapRow] Failed to calculate date difference for ${project.projectKey}:`, { firstOldDueDate, latestNewDueDate });
        return null;
      }
      
      return { days: diffDays, firstDate: firstOldDueDate, latestDate: latestNewDueDate };
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
      
      {weekCells.map((cell: any, i: number) => (
        <div key={i} className={cell.cellClass}>
          {cell.weekUpdates.map((update: any, idx: number) => {
            const analysis = analyzeUpdateCell(update);
            
            return (
              <UpdateCellContent
                key={idx}
                analysis={analysis}
                showEmojis={showEmojis}
                update={update}
                onUpdateClick={setSelectedUpdate}
              />
            );
          })}
        </div>
      ))}
      
      <div className="timeline-target-date">     
        {targetDateDisplay ? (
          <span style={{ color: '#333', fontSize: '13px', fontWeight: '500' }}>
            {targetDateDisplay}
          </span>
        ) : (
          <span style={{ color: '#6b7280', fontSize: '12px' }}>No target date</span>
        )}
      </div>
      
      {/* Days Shift Column */}
      <div className="timeline-days-shift">
        {daysShift !== null ? (
          <DateDifference 
            oldDate={daysShift.firstDate} 
            newDate={daysShift.latestDate} 
            className="days-shift-value" 
          />
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