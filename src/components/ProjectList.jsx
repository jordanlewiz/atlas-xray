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
  const updateDates = updates ? updates.map(u => u.creationDate).filter(Boolean) : [];

  return (
    <li className="atlas-xray-modal-list-item">
      {project.projectKey} {project.name ? `- ${project.name}` : ""}
      {updateDates.length > 0 && (
        <ul className="atlas-xray-update-list">
          {updateDates.map((date, i) => (
            <li key={i}>{formatDate(date)}</li>
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
