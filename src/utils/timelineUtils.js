import { parseISO, isValid, isAfter, isBefore, startOfWeek, addWeeks, format } from "date-fns";

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
