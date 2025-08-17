import React from "react";
import { format, isAfter, isBefore, isSameWeek, parseISO, startOfWeek, addWeeks, isValid } from "date-fns";

/**
 * Safely parses a date string, supporting ISO and non-ISO formats.
 */
function safeParseDate(dateStr) {
  let d = null;
  try {
    d = parseISO(dateStr);
  } catch (e) {
    d = new Date(dateStr);
  }
  if (!isValid(d)) d = new Date(dateStr);
  return d;
}

/**
 * Generates week ranges (Monday-Sunday) between two dates.
 */
function getWeekRanges(startDate, endDate) {
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

/**
 * Finds the global min/max dates for all projects for timeline alignment.
 */
function getAllProjectDates(projects, updatesByProject) {
  let minDate = null;
  let maxDate = null;
  (projects || []).forEach(proj => {
    const updates = updatesByProject[proj.projectKey] || [];
    updates.forEach(dateStr => {
      const date = safeParseDate(dateStr);
      if (!minDate || isBefore(date, minDate)) minDate = date;
      if (!maxDate || isAfter(date, maxDate)) maxDate = date;
    });
  });
  return { minDate, maxDate };
}

/**
 * ProjectTimeline view model is passed as the viewModel prop.
 * Contains: { projects, updatesByProject }
 */
const ProjectTimeline = ({ viewModel }) => {
  const { projects, updatesByProject } = viewModel;
  const { minDate, maxDate } = getAllProjectDates(projects, updatesByProject);
  if (!minDate || !maxDate) return null;
  const weekRanges = getWeekRanges(minDate, maxDate);

  return (
    console.log("updatesByProject", projects),
    <div className="project-timeline">
      <div className="timeline-row timeline-labels">
        <div className="timeline-y-label" />
        {weekRanges.map((w, i) => (
          <div key={i} className="timeline-x-label">{w.label}</div>
        ))}
      </div>
      {projects.map((proj, idx) => {
        // updates is an array of update objects
        const updates = updatesByProject[proj.projectKey] || [];
        return (
          <div className="timeline-row" key={proj.projectKey || idx}>
            <div className="timeline-y-label">{proj.name || proj.projectKey}</div>
            {weekRanges.map((w, i) => {
              // Find the first update object for this week
              const update = updates.find(u =>
                isSameWeek(safeParseDate(u.creationDate), w.start, { weekStartsOn: 1 })
              );
              return (
                <div key={i} className={`timeline-cell${update ? ' has-update' : ''}`}>
                  {update ? format(safeParseDate(update.creationDate), 'd MMM') : ''}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ProjectTimeline;
