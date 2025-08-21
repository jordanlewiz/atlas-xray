import * as chrono from "chrono-node";
import { parse, differenceInCalendarDays, isValid, parseISO, isAfter, isBefore, startOfWeek, addWeeks, format, isSameWeek, subWeeks, subDays, lastDayOfMonth } from "date-fns";
import { getGlobalCloudId, getGlobalSectionId } from "../globalState";
import type { ProjectViewModel, WeekRange, ProjectUpdate } from "../../types";

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

export function safeParseDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date('Invalid Date');
  
  // Try parseISO first (for ISO format dates)
  let d = parseISO(dateStr);
  if (isValid(d)) return d;
  
  // Try direct Date constructor (for various formats)
  d = new Date(dateStr);
  if (isValid(d)) return d;
  
  // Try parsing as timestamp
  const timestamp = parseInt(dateStr, 10);
  if (!isNaN(timestamp)) {
    d = new Date(timestamp);
    if (isValid(d)) return d;
  }
  
  // If all else fails, return invalid date
  console.warn('[AtlasXray] Failed to parse date:', dateStr);
  return new Date('Invalid Date');
}

export function getWeekRanges(startDate: Date, endDate: Date): WeekRange[] {
  const weeks: WeekRange[] = [];
  let current = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday
  let last = startOfWeek(endDate, { weekStartsOn: 1 });
  const now = new Date();
  const thisWeek = startOfWeek(now, { weekStartsOn: 1 });

  // Ensure the range always includes 'This week'
  if (isAfter(thisWeek, last)) {
    last = thisWeek;
  }

  while (!isAfter(current, last)) {
    const weekStart = current;
    const weekEnd = addWeeks(weekStart, 1); // exclusive end
    const weekEndLabel = subDays(weekEnd, 1); // inclusive end for label
    let label: string;
    
    if (isSameWeek(weekStart, now, { weekStartsOn: 1 })) {
      label = "This week";
    } else if (isSameWeek(weekStart, startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), { weekStartsOn: 1 })) {
      label = "Last week";
    } else {
      // If week spans two months, show both months
      const startDay = format(weekStart, "d");
      const startMonth = format(weekStart, "MMM");
      const endDay = format(weekEndLabel, "d");
      const endMonth = format(weekEndLabel, "MMM");
      if (startMonth === endMonth) {
        label = `${startDay}-${endDay} ${startMonth}`;
      } else {
        label = `${startDay} ${startMonth}-${endDay} ${endMonth}`;
      }
    }
    
    weeks.push({
      label,
      start: weekStart,
      end: weekEnd
    });
    current = addWeeks(current, 1);
  }
  return weeks;
}

export function getAllProjectDates(projects: ProjectViewModel[], updatesByProject: Record<string, any[]>): { minDate: Date | null; maxDate: Date | null } {
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  
  (projects || []).forEach(proj => {
    const updates = updatesByProject[proj.projectKey] || [];
    updates.forEach(u => {
      if (u && u.creationDate) {
        // Based on console logs, creationDate is directly accessible
        const date = safeParseDate(u.creationDate);
        if (date && !isNaN(date.getTime())) {
          if (!minDate || isBefore(date, minDate)) minDate = date;
          if (!maxDate || isAfter(date, maxDate)) maxDate = date;
        }
      }
    });
  });
  return { minDate, maxDate };
}

export function buildProjectUrlFromKey(projectKey: string): string | undefined {
  const cloudId = getGlobalCloudId();
  const sectionId = getGlobalSectionId();
  if (!cloudId || !sectionId || !projectKey) return undefined;
  return `https://home.atlassian.com/o/${cloudId}/s/${sectionId}/project/${projectKey}/updates`;
}

// Flexible date parser for ranges and month names using chrono-node
export function parseFlexibleDateChrono(dateStr: string, year: number = new Date().getFullYear(), isEnd: boolean = false): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // If it's a range, always use the end of the range
  if (dateStr.includes('-')) {
    const [start, end] = dateStr.split('-').map(s => s.trim());
    return parseFlexibleDateChrono(end, year, true);
  }
  
  // If it's a month name, parse as the first or last of the month
  const monthIdx = MONTHS.findIndex(m => dateStr.toLowerCase().startsWith(m));
  if (monthIdx !== -1) {
    if (isEnd) {
      return lastDayOfMonth(new Date(year, monthIdx, 1));
    } else {
      return new Date(year, monthIdx, 1);
    }
  }
  
  // If it's a day and month (e.g., '15 Dec'), parse explicitly
  const dayMonthMatch = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3,})$/);
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const monthStr = dayMonthMatch[2].toLowerCase();
    const idx = MONTHS.findIndex(m => monthStr.startsWith(m));
    if (idx !== -1) {
      return new Date(year, idx, day);
    }
  }
  
  // Use chrono-node to parse, always providing a reference date in the current year
  const refDate = new Date(`${year}-01-01`);
  const results = chrono.parse(dateStr, refDate);
  if (results.length > 0) {
    // If the parsed result has no year, chrono will use the reference year
    return results[0].start.date();
  }
  
  return null;
}

export function daysBetweenFlexibleDates(dateStr1: string, dateStr2: string, year: number): number | null {
  // Safety checks for input parameters
  if (!dateStr1 || !dateStr2 || typeof dateStr1 !== 'string' || typeof dateStr2 !== 'string') {
    return null;
  }
  
  // Always use isEnd=true for the first argument if it's a range
  const d1 = parseFlexibleDateChrono(dateStr1, year, dateStr1.includes('-') ? true : false);
  const d2 = parseFlexibleDateChrono(dateStr2, year, true);
  
  if (!d1 || !d2) return null;
  
  const diff = differenceInCalendarDays(d2, d1);
  if (diff === 0) return 1;
  return diff > 0 ? diff + 1 : diff - 1;
}

// Timeline cell interface for rendering
interface TimelineCell {
  cellClass: string;
  weekUpdates: ProjectUpdate[];
}

// Memoization cache for timeline cells to improve performance with many projects
const timelineCellCache = new Map<string, TimelineCell[]>();

  // Cache key generator for timeline cells
  function getTimelineCellCacheKey(weekRanges: WeekRange[], updates: ProjectUpdate[]): string {
    const weekRangeKey = weekRanges.map(w => `${w.start.getTime()}-${w.end.getTime()}`).join('|');
    const updatesKey = updates.map(u => `${u.id || 'unknown'}-${u.creationDate || 'no-date'}`).join('|');
    return `${weekRangeKey}|${updatesKey}`;
  }

// Timeline rendering utilities
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

  // Check cache first for performance
  const cacheKey = getTimelineCellCacheKey(weekRanges, updates);
  if (timelineCellCache.has(cacheKey)) {
    return timelineCellCache.get(cacheKey)!;
  }
  
  // Pre-process updates once to avoid repeated filtering and date parsing
  const validUpdates = updates.filter(u => {
    if (!u) return false;
    const creationDate = u.creationDate || (u as any).raw?.creationDate;
    return creationDate && typeof creationDate === 'string';
  });

  

  // Pre-parse all dates once to avoid repeated parsing
  const updatesWithDates = validUpdates.map(u => {
    const creationDate = u.creationDate || (u as any).raw?.creationDate;
    if (!creationDate || typeof creationDate !== 'string') {
      return null;
    }
    const parsedDate = safeParseDate(creationDate);
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    return {
      update: u,
      parsedDate
    };
  }).filter((item): item is { update: ProjectUpdate; parsedDate: Date } => item !== null);



  // Group updates by week range more efficiently
  const weekUpdatesMap = new Map<number, ProjectUpdate[]>();
  
  weekRanges.forEach((week, weekIndex) => {
    weekUpdatesMap.set(weekIndex, []);
  });

  updatesWithDates.forEach(({ update, parsedDate }) => {
    let foundWeek = false;
    for (let i = 0; i < weekRanges.length; i++) {
      const week = weekRanges[i];
      if (parsedDate >= week.start && parsedDate < week.end) {
        const existing = weekUpdatesMap.get(i) || [];
        existing.push(update);
        weekUpdatesMap.set(i, existing);
        foundWeek = true;
        break; // Update can only be in one week
      }
    }
  });

  // Generate cells efficiently
  const cells = weekRanges.map((week, weekIndex) => {
    const weekUpdates = weekUpdatesMap.get(weekIndex) || [];
    
    // Sort updates by creationDate (oldest to newest) to ensure consistent ordering
    const sortedWeekUpdates = weekUpdates.sort((a, b) => {
      const dateA = a.creationDate && typeof a.creationDate === 'string' ? new Date(a.creationDate).getTime() : 0;
      const dateB = b.creationDate && typeof b.creationDate === 'string' ? new Date(b.creationDate).getTime() : 0;
      return dateA - dateB; // Oldest first
    });
    
    const lastUpdate = sortedWeekUpdates.length > 0 ? sortedWeekUpdates[sortedWeekUpdates.length - 1] : undefined;
    
    // Generate cell class inline
    let stateClass = 'state-none';
    if (lastUpdate) {
      if (lastUpdate.missedUpdate) stateClass = 'state-missed-update';
      else if (lastUpdate.state && typeof lastUpdate.state === 'string') {
        stateClass = `state-${lastUpdate.state.replace(/_/g, '-').toLowerCase()}`;
      }
    }
    
    let oldStateClass = '';
    if (lastUpdate && lastUpdate.oldState && typeof lastUpdate.oldState === 'string') {
      oldStateClass = `old-state-${lastUpdate.oldState.replace(/_/g, '-').toLowerCase()}`;
    }
    
    const cellClass = [
      'timeline-cell',
      sortedWeekUpdates.length > 0 ? 'has-update' : '',
      stateClass,
      oldStateClass
    ].filter(Boolean).join(' ');
    
    return {
      cellClass,
      weekUpdates: sortedWeekUpdates,
    };
  });

  // Cache the result for future use
  timelineCellCache.set(cacheKey, cells);
  
  // Limit cache size to prevent memory issues
  if (timelineCellCache.size > 100) {
    const firstKey = timelineCellCache.keys().next().value;
    timelineCellCache.delete(firstKey);
  }

  return cells;
}

export function getDueDateTooltip(u: ProjectUpdate): string | null {
  if (u && u.oldDueDate && u.newDueDate && typeof u.oldDueDate === 'string' && typeof u.newDueDate === 'string') {
    return `${u.oldDueDate} → ${u.newDueDate}`;
  }
  return null;
}

export function getDueDateDiff(u: ProjectUpdate): number | null {
  if (u?.oldDueDate && u?.newDueDate && typeof u.oldDueDate === 'string' && typeof u.newDueDate === 'string') {
    return daysBetweenFlexibleDates(u.oldDueDate, u.newDueDate, new Date().getFullYear());
  }
  return null;
}
