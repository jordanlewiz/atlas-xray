import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import formatDate from "../utils/formatDate";

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
              {update.targetDate && (
                <span> | <b>Target Date:</b> {formatDate(update.targetDate)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {statusHistory && statusHistory.length > 0 && (
        <ul className="atlas-xray-update-list" style={{ marginTop: 8 }}>
          <li><b>Status History:</b></li>
          {statusHistory.map((entry, i) => (
            <li key={entry.id || i}>
              <b>Date:</b> {formatDate(entry.raw.creationDate)}
              {entry.raw && entry.raw.status && <span> | <b>Status:</b> {entry.raw.status}</span>}
              {entry.raw && entry.raw.author && <span> | <b>By:</b> {entry.raw.author.displayName}</span>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ProjectList({ projects }) {
  if (!projects || projects.length === 0) return <li>No projects found.</li>;
  return <>{projects.map((p, i) => <ProjectListItem key={p.projectKey || i} project={p} />)}</>;
}
