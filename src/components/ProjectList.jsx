import React, { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import ProjectTimeline from "./ProjectTimeline.jsx";
import ProjectListItem from "./ProjectListItem.jsx";

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
      {(!projects || projects.length === 0)
        ? <li>No projects found.</li>
        : projects.map((p, i) => <ProjectListItem key={p.projectKey || i} project={p} />)}
    </>
  );
}
