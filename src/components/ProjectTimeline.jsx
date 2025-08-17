import React from "react";
import { format, isAfter, isBefore, isSameWeek, parseISO, startOfWeek, addWeeks, isValid } from "date-fns";

/**
 * Safely parses a date string, supporting ISO and non-ISO formats.
 */
function safeParseDate(dateStr) {
  if (!dateStr) return new Date('Invalid Date');
  let d = parseISO(dateStr);
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
        // Only use updates with a valid string creationDate
        const validUpdates = updates.filter(u => u && typeof u.creationDate === 'string');
        return (
          <div className="timeline-row" key={proj.projectKey || idx}>
            <div className="timeline-y-label">{proj.name || proj.projectKey}</div>
            {weekRanges.map((w, i) => {
              const weekStart = w.start;
              const weekEnd = w.end;
              const weekUpdates = validUpdates.filter(u => {
                const d = safeParseDate(u.creationDate);
                return d && d >= weekStart && d < weekEnd;
              });
              return (
                <div key={i} className={`timeline-cell${weekUpdates.length > 0 ? ' has-update' : ''}`}>
                  {weekUpdates.map((u, idx) => (
                    <div key={idx}>
                      {format(safeParseDate(u.creationDate), 'd MMM')}
                      {u.state && <span> | State: {u.state}</span>}
                      {u.oldState && <span> | Old State: {u.oldState}</span>}
                    </div>
                  ))}
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