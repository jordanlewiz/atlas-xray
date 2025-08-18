import { parse, differenceInCalendarDays, isValid, parseISO, isAfter, isBefore, startOfWeek, addWeeks, format } from "date-fns";
import { getGlobalCloudId, getGlobalSectionId } from "./globalState";

export function safeParseDate(dateStr) {
  if (!dateStr) return new Date('Invalid Date');
  let d = parseISO(dateStr);
  if (!isValid(d)) d = new Date(dateStr);
  return d;
}

export function getWeekRanges(startDate, endDate) {
  const weeks = [];
  let current = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday
  const last = startOfWeek(endDate, { weekStartsOn: 1 });
  while (!isAfter(current, last)) {
    const weekStart = current;
    weeks.push({
      label: `${format(weekStart, 'd MMM')}-${format(addWeeks(weekStart, 1), 'd MMM')}`,
      start: weekStart,
      end: addWeeks(weekStart, 1)
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
      const date = safeParseDate(u.creationDate);
      if (!minDate || isBefore(date, minDate)) minDate = date;
      if (!maxDate || isAfter(date, maxDate)) maxDate = date;
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

// Flexible date parser for ranges and month names
function parseFlexibleDate(dateStr, year = new Date().getFullYear()) {
  if (!dateStr) return null;
  // Handle range: "Apr-Jun"
  if (dateStr.includes('-')) {
    const [start, end] = dateStr.split('-').map(s => s.trim());
    // Use the end of the range for difference calculation
    return parseFlexibleDate(end, year);
  }
  // Handle month only: "August"
  if (/^[A-Za-z]+$/.test(dateStr)) {
    return parse(`1 ${dateStr} ${year}`, 'd MMMM yyyy', new Date());
  }
  // Handle day and month: "26 Feb"
  if (/^\d{1,2} [A-Za-z]+$/.test(dateStr)) {
    return parse(`${dateStr} ${year}`, 'd MMM yyyy', new Date());
  }
  // Fallback: try to parse as ISO or other formats
  const d = new Date(dateStr);
  return isValid(d) ? d : null;
}

export function daysBetweenFlexibleDates(dateStr1, dateStr2) {
  const d1 = parseFlexibleDate(dateStr1);
  const d2 = parseFlexibleDate(dateStr2);
  if (!d1 || !d2) return null;
  return differenceInCalendarDays(d2, d1);
}
