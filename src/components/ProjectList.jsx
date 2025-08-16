import React from "react";

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleString();
}

function ProjectListItem({ project }) {
  return (
    <li className="atlas-xray-modal-list-item">
      {project.projectKey} {project.name ? `- ${project.name}` : ""}
      {project.updateDates.length > 0 && (
        <ul className="atlas-xray-update-list">
          {project.updateDates.map((date, i) => (
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
