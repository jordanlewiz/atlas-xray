import React from "react";
import type { StatusTimelineHeatmapProps } from "../../types";
import StatusTimelineHeatmapHeader from "./StatusTimelineHeatmapHeader";
import { useTimeline } from "../../hooks/useTimelineData";
import { getTimelineWeekCells, getTargetDateDisplay, buildProjectUrlFromKey } from "../../utils/timelineUtils";

/**
 * Content Script version of StatusTimelineHeatmap - No AI dependencies
 */
export default function StatusTimelineHeatmapContentScript({ weekLimit = 12 }: StatusTimelineHeatmapProps): React.JSX.Element {
  const { weekRanges, projectViewModels, updatesByProject, isLoading } = useTimeline(weekLimit);

  if (isLoading) {
    return <div>Loading timeline data...</div>;
  }

  if (projectViewModels.length === 0) {
    return <div>No projects found. Please navigate to an Atlassian project page.</div>;
  }

  // Limit the number of weeks displayed
  const limitedWeekRanges = weekRanges.slice(0, weekLimit);

  return (
    <div className="project-timeline">
      <StatusTimelineHeatmapHeader weekRanges={limitedWeekRanges} />
      
      {projectViewModels.filter(Boolean).map((project, idx) => (
        <StatusTimelineRowContentScript
          key={project.projectKey || idx}
          project={project}
          weekRanges={limitedWeekRanges}
          updates={updatesByProject[project.projectKey] || []}
        />
      ))}
    </div>
  );
}

/**
 * Content Script version of StatusTimelineHeatmapRow - No AI dependencies
 */
function StatusTimelineRowContentScript({ 
  project, 
  weekRanges, 
  updates 
}: {
  project: any;
  weekRanges: any[];
  updates: any[];
}): React.JSX.Element | null {
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
        <h3 className="project-title-ellipsis">
          {project.name}
        </h3>
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
              style={{ cursor: 'pointer' }}
            >
              {/* Show date difference if there's a date change */}
              {u.oldDueDate && u.newDueDate && (
                <span className="date-difference">
                  {(() => {
                    const oldDate = new Date(u.oldDueDate);
                    const newDate = new Date(u.newDueDate);
                    const diff = Math.ceil((newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24));
                    return diff !== 0 ? (diff > 0 ? `+${diff}` : `${diff}`) : '';
                  })()}
                </span>
              )}
              
              {/* Show update indicator for any cell with updates */}
              {!u.oldDueDate && (
                <span className="update-indicator">•</span>
              )}
            </div>
          ))}
        </div>
      ))}
      
      <div className="timeline-target-date">     
        {targetDateRaw ? (
          <span className="target-date-display">
            {targetDateDisplay}
          </span>
        ) : (
          <span style={{ color: '#6b7280', fontSize: '12px' }}>No target date</span>
        )}
      </div>
    </div>
  );
}
