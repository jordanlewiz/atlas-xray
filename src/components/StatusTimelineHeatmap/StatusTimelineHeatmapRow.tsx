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
import { log, setFilePrefix } from '../../utils/logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[StatusTimelineHeatmapRow]');

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
    log.warn('ProjectTimelineRow received undefined project');
    return null;
  }

  const weekCells = getTimelineWeekCells(weekRanges, updates);
  
  // Get latest newTargetDate from all updates
  const latestDueDate = updates
    .filter(u => u.newTargetDate)
    .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0]?.newTargetDate ||
    null;
  // For Target Date column, show the original text (e.g., "October-December 2025"), not parsed date
  const targetDateDisplay = latestDueDate || null;

  // Calculate days shift between first and latest due dates
  const daysShift = useMemo(() => {
    if (!updates || updates.length === 0) return null;

    // Try to use the new newTargetDateParsed fields first for more accurate comparison
    const updatesWithParsedDates = updates.filter(u => u.newTargetDateParsed);
    
    if (updatesWithParsedDates.length >= 2) {
      const firstUpdate = updatesWithParsedDates[0];
      const latestUpdate = updatesWithParsedDates[updatesWithParsedDates.length - 1];
      
      if (firstUpdate.newTargetDateParsed && latestUpdate.newTargetDateParsed) {
        const daysDiff = daysBetweenFlexibleDates(
          firstUpdate.newTargetDateParsed, 
          latestUpdate.newTargetDateParsed, 
          new Date().getFullYear()
        );
        
        return {
          firstDate: firstUpdate.newTargetDateParsed,
          latestDate: latestUpdate.newTargetDateParsed,
          daysDiff
        };
      }
    }
    
    // Fallback: try to use newTargetDate fields if newTargetDateParsed is not available
    const updatesWithDates = updates.filter(u => u.newTargetDate);
    
    if (updatesWithDates.length >= 2) {
      const firstUpdate = updatesWithDates[0];
      const latestUpdate = updatesWithDates[updatesWithDates.length - 1];
      
      if (firstUpdate.newTargetDate && latestUpdate.newTargetDate) {
        const daysDiff = daysBetweenFlexibleDates(firstUpdate.newTargetDate, latestUpdate.newTargetDate, new Date().getFullYear());
        
        if (daysDiff !== null) {
          return {
            firstDate: firstUpdate.newTargetDate,
            latestDate: latestUpdate.newTargetDate,
            daysDiff
          };
        }
      }
    }
    
    // If no dates available, return null
    return null;
  }, [updates]);

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