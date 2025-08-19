import { safeParseDate, daysBetweenFlexibleDates } from "./timelineUtils";
import { format } from "date-fns";
import type { ProjectUpdate, WeekRange } from "../../types";

interface TimelineCell {
  cellClass: string;
  weekUpdates: ProjectUpdate[];
}

interface LastUpdate {
  missedUpdate?: boolean;
  state?: string;
  oldState?: string;
}

export function getTimelineCellClass(lastUpdate: LastUpdate | undefined, weekUpdates: ProjectUpdate[]): string {
  let stateClass = 'state-none';
  if (lastUpdate) {
    // Based on console logs, data is directly accessible
    if (lastUpdate.missedUpdate) stateClass = 'state-missed-update';
    else if (lastUpdate.state && typeof lastUpdate.state === 'string') {
      stateClass = `state-${lastUpdate.state.replace(/_/g, '-').toLowerCase()}`;
    }
  }
  
  let oldStateClass = '';
  if (lastUpdate && lastUpdate.oldState && typeof lastUpdate.oldState === 'string') {
    oldStateClass = `old-state-${lastUpdate.oldState.replace(/_/g, '-').toLowerCase()}`;
  }
  
  return [
    'timeline-cell',
    weekUpdates.length > 0 ? 'has-update' : '',
    stateClass,
    oldStateClass
  ].filter(Boolean).join(' ');
}

export function getTargetDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') {
    return 'No date';
  }
  const d = safeParseDate(dateStr);
  if (d && !isNaN(d.getTime())) {
    return format(d, 'd MMM yyyy');
  }
  return dateStr;
}

export function getTimelineWeekCells(weekRanges: WeekRange[], updates: ProjectUpdate[]): TimelineCell[] {
  if (!updates || !Array.isArray(updates)) {
    return weekRanges.map(() => ({
      cellClass: 'timeline-cell state-none',
      weekUpdates: [],
    }));
  }
  
  const validUpdates = updates.filter(u => {
    if (!u) return false;
    // Based on console logs, data is directly accessible
    const creationDate = u.creationDate || (u as any).raw?.creationDate;
    return creationDate && typeof creationDate === 'string';
  });
  
  return weekRanges.map((w) => {
    const weekStart = w.start;
    const weekEnd = w.end;
    const weekUpdates = validUpdates.filter(u => {
      const creationDate = u.creationDate || (u as any).raw?.creationDate;
      const d = safeParseDate(creationDate);
      return d && d >= weekStart && d < weekEnd;
    });
    const lastUpdate = weekUpdates.length > 0 ? weekUpdates[weekUpdates.length - 1] : undefined;
    return {
      cellClass: getTimelineCellClass(lastUpdate, weekUpdates),
      weekUpdates,
    };
  });
}

export function getDueDateTooltip(u: ProjectUpdate): string | null {
  if (u && u.oldDueDate && u.newDueDate) {
    return `${u.oldDueDate} → ${u.newDueDate}`;
  }
  return null;
}

export function getDueDateDiff(u: ProjectUpdate): number | null {
  if (u && u.oldDueDate && u.newDueDate) {
    return daysBetweenFlexibleDates(u.oldDueDate, u.newDueDate, new Date().getFullYear());
  }
  return null;
}
