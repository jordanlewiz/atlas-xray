import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import formatDate from "../utils/formatDate";
import { startOfWeek, addWeeks, format, isAfter, isBefore, isSameWeek, parseISO, isValid } from "date-fns";
import { useMemo } from "react";

// Utility: Generate week ranges (Monday-Sunday) between two dates
function getWeekRanges(startDate, endDate) {
  const weeks = [];
  let current = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday
  const last = startOfWeek(endDate, { weekStartsOn: 1 });
  while (!isAfter(current, last)) {
    const weekStart = current;
    const weekEnd = addWeeks(current, 1);
    weeks.push({
      label: `${format(weekStart, 'd MMM')}-${format(addWeeks(weekStart, 1), 'd MMM')}`,
      start: weekStart,
      end: addWeeks(weekStart, 1)
    });
    current = addWeeks(current, 1);
  }
  return weeks;
}

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

function ProjectTimeline({ projects, updatesByProject }) {
  // 1. Find global min/max dates
  const { minDate, maxDate } = getAllProjectDates(projects, updatesByProject);
  if (!minDate || !maxDate) return null;
  // 2. Generate week ranges
  const weekRanges = getWeekRanges(minDate, maxDate);

  return (
    <div className="project-timeline">
      {/* Week labels */}
      <div className="timeline-row timeline-labels">
        <div className="timeline-label project-label" />
        {weekRanges.map((w, i) => (
          <div key={i} className="timeline-label">{w.label}</div>
        ))}
      </div>
      {/* Project rows */}
      {projects.map((proj, idx) => {
        const updates = updatesByProject[proj.projectKey] || [];
        return (
          <div className="timeline-row" key={proj.projectKey || idx}>
            <div className="timeline-label project-label">{proj.name || proj.projectKey}</div>
            {weekRanges.map((w, i) => {
              // Find update in this week
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
}

function ProjectListItem({ project }) {
  // Fetch normalized updates for this projectKey
  const updates = useLiveQuery(
    () => db.projectUpdates.where("projectKey").equals(project.projectKey).toArray(),
    [project.projectKey]
  );
  // Fetch all status history rows for this projectKey
  const statusHistory = useLiveQuery(
    () => db.projectStatusHistory.where("projectKey").equals(project.projectKey).toArray(),
    [project.projectKey]
  );
  const showBool = (val) => val ? "Yes" : "No";

  return (
    <li className="atlas-xray-modal-list-item">
      {project.projectKey} {project.name ? `- ${project.name}` : ""}
      {updates && updates.length > 0 && (
        <ul className="atlas-xray-update-list">
          {updates.map((update, i) => (
            <li key={update.id || i}>
              <b>Date:</b> {formatDate(update.creationDate)}
              {update.state && <span> | <b>State:</b> {update.state}</span>}
              {typeof update.missedUpdate !== 'undefined' && (
                <span> | <b>Missed:</b> {showBool(update.missedUpdate)}</span>
              )}

              <span>
                | <b>Target Date:</b>
                {update.oldDueDate && (
                  <> <del style={{ color: "red" }}>{update.oldDueDate}</del> </>
                )}
                {update.newDueDate && (
                  <> | {formatDate(update.newDueDate)} </>
                )}
              </span>

              {update.oldState && (
                <span style={{ color: "orange" }}> | <b>Old State:</b> {update.oldState}
                </span>
              )}
              {update.raw?.creator?.displayName && (
                <span> | <b>By:</b> {update.raw.creator.displayName}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      
    </li>
  );
}

export default function ProjectList({ projects }) {
  // Fetch all updates for all projects
  const allUpdates = useLiveQuery(() => db.projectUpdates.toArray(), []);

  // Compute updatesByProject: { [projectKey]: [dateStr, ...] }
  const updatesByProject = useMemo(() => {
    const map = {};
    if (allUpdates) {
      allUpdates.forEach(update => {
        if (!update.projectKey) return;
        if (!map[update.projectKey]) map[update.projectKey] = [];
        if (update.creationDate) map[update.projectKey].push(update.creationDate);
      });
    }
    return map;
  }, [allUpdates]);

  return (
    <>
      <ProjectTimeline projects={projects} updatesByProject={updatesByProject} />
      {(!projects || projects.length === 0) ? <li>No projects found.</li> : projects.map((p, i) => <ProjectListItem key={p.projectKey || i} project={p} />)}
    </>
  );
}
