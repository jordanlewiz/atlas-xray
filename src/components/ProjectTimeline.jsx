import React from "react";
import { format, isAfter, isBefore, isSameWeek, parseISO, startOfWeek, addWeeks, isValid } from "date-fns";

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

const ProjectTimeline = ({ projects, updatesByProject }) => {
  const { minDate, maxDate } = getAllProjectDates(projects, updatesByProject);
  if (!minDate || !maxDate) return null;
  const weekRanges = getWeekRanges(minDate, maxDate);

  return (
    <div className="project-timeline">
      <div className="timeline-row timeline-labels">
        <div className="timeline-label project-label" />
        {weekRanges.map((w, i) => (
          <div key={i} className="timeline-label">{w.label}</div>
        ))}
      </div>
      {projects.map((proj, idx) => {
        const updates = updatesByProject[proj.projectKey] || [];
        return (
          <div className="timeline-row" key={proj.projectKey || idx}>
            <div className="timeline-label project-label">{proj.name || proj.projectKey}</div>
            {weekRanges.map((w, i) => {
              const update = updates.find(dateStr => isSameWeek(safeParseDate(dateStr), w.start, { weekStartsOn: 1 }));
              return (
                <div key={i} className={`timeline-cell${update ? ' has-update' : ''}`}>{update ? format(safeParseDate(update), 'd MMM') : ''}</div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ProjectTimeline;
