import * as chrono from "chrono-node";
import { parse, differenceInCalendarDays, isValid, parseISO, isAfter, isBefore, startOfWeek, addWeeks, format, isSameWeek, subWeeks, subDays, lastDayOfMonth } from "date-fns";
import { getGlobalCloudId, getGlobalSectionId } from "../globalState";

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

export function safeParseDate(dateStr) {
  if (!dateStr) return new Date('Invalid Date');
  let d = parseISO(dateStr);
  if (!isValid(d)) d = new Date(dateStr);
  return d;
}

export function getWeekRanges(startDate, endDate) {
  const weeks = [];
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
    let label;
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

export function getAllProjectDates(projects, updatesByProject) {
  let minDate = null;
  let maxDate = null;
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

export function buildProjectUrlFromKey(projectKey) {
  const cloudId = getGlobalCloudId();
  const sectionId = getGlobalSectionId();
  if (!cloudId || !sectionId || !projectKey) return undefined;
  return `https://home.atlassian.com/o/${cloudId}/s/${sectionId}/project/${projectKey}/updates`;
}

// Flexible date parser for ranges and month names using chrono-node
export function parseFlexibleDateChrono(dateStr, year = new Date().getFullYear(), isEnd = false) {
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

export function daysBetweenFlexibleDates(dateStr1, dateStr2, year) {
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
