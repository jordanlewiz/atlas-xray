import * as chrono from "chrono-node";
import { parse, differenceInCalendarDays, isValid, parseISO, isAfter, isBefore, startOfWeek, addWeeks, format, isSameWeek, subWeeks } from "date-fns";
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
  const now = new Date();
  const thisWeek = startOfWeek(now, { weekStartsOn: 1 });
  const lastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  while (!isAfter(current, last)) {
    const weekStart = current;
    const weekEnd = addWeeks(weekStart, 1);
    let label;
    if (isSameWeek(weekStart, now, { weekStartsOn: 1 })) {
      label = "This week";
    } else if (isSameWeek(weekStart, lastWeek, { weekStartsOn: 1 })) {
      label = "Last week";
    } else {
      // If week spans two months, show both months
      const startDay = format(weekStart, "d");
      const startMonth = format(weekStart, "MMM");
      const endDay = format(subWeeks(weekEnd, 0), "d");
      const endMonth = format(subWeeks(weekEnd, 0), "MMM");
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

// Flexible date parser for ranges and month names using chrono-node
function parseFlexibleDateChrono(dateStr, year = new Date().getFullYear()) {
  if (!dateStr) return null;
  // If it's a range, use the end of the range
  if (dateStr.includes('-')) {
    const [start, end] = dateStr.split('-').map(s => s.trim());
    return parseFlexibleDateChrono(end, year);
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

export function daysBetweenFlexibleDates(dateStr1, dateStr2) {
  const d1 = parseFlexibleDateChrono(dateStr1);
  const d2 = parseFlexibleDateChrono(dateStr2);
  if (!d1 || !d2) return null;
  return differenceInCalendarDays(d2, d1);
}
