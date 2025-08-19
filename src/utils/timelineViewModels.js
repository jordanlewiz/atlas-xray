import { safeParseDate } from "./timelineUtils";
import { format } from "date-fns";
import { daysBetweenFlexibleDates } from "./timelineUtils";

export function getTimelineCellClass(lastUpdate, weekUpdates) {
  let stateClass = 'state-none';
  if (lastUpdate) {
    if (lastUpdate.missedUpdate) stateClass = 'state-missed-update';
    else if (lastUpdate.state) stateClass = `state-${lastUpdate.state.replace(/_/g, '-').toLowerCase()}`;
  }
  let oldStateClass = '';
  if (lastUpdate && lastUpdate.oldState) {
    oldStateClass = `old-state-${lastUpdate.oldState.replace(/_/g, '-').toLowerCase()}`;
  }
  return [
    'timeline-cell',
    weekUpdates.length > 0 ? 'has-update' : '',
    stateClass,
    oldStateClass
  ].filter(Boolean).join(' ');
}

export function getTargetDateDisplay(dateStr) {
  const d = safeParseDate(dateStr);
  if (d && !isNaN(d.getTime())) {
    return format(d, 'd MMM yyyy');
  }
  return dateStr;
}

export function getTimelineWeekCells(weekRanges, updates) {
  const validUpdates = updates.filter(u => u && typeof u.creationDate === 'string');
  return weekRanges.map((w) => {
    const weekStart = w.start;
    const weekEnd = w.end;
    const weekUpdates = validUpdates.filter(u => {
      const d = safeParseDate(u.creationDate);
      return d && d >= weekStart && d < weekEnd;
    });
    const lastUpdate = weekUpdates.length > 0 ? weekUpdates[weekUpdates.length - 1] : undefined;
    return {
      cellClass: getTimelineCellClass(lastUpdate, weekUpdates),
      weekUpdates,
    };
  });
}

export function getDueDateTooltip(u) {
  if (u.oldDueDate && u.newDueDate) {
    return `${u.oldDueDate} → ${u.newDueDate}`;
  }
  return null;
}

export function getDueDateDiff(u) {
  if (u.oldDueDate && u.newDueDate) {
    return daysBetweenFlexibleDates(u.oldDueDate, u.newDueDate);
  }
  return null;
}
