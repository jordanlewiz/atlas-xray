import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";
import formatDate from "../utils/formatDate";

const ProjectListItem = ({ project }) => {
  const updates = useLiveQuery(
    () => db.projectUpdates.where("projectKey").equals(project.projectKey).toArray(),
    [project.projectKey]
  );
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
      {statusHistory && statusHistory.length > 0 && (
        <ul className="atlas-xray-update-list" style={{ marginTop: 8 }}>
          <li><b>Status History:</b></li>
          {statusHistory.map((entry, i) => (
            <li key={entry.id || i}>
              <b>Date:</b> {formatDate(entry.raw?.creationDate)}
              {entry.raw?.oldTargetDate && (
                <span> | <b>Old Target Date:</b> {typeof entry.raw.oldTargetDate === 'object'
                  ? (entry.raw.oldTargetDate.label || JSON.stringify(entry.raw.oldTargetDate))
                  : formatDate(entry.raw.oldTargetDate)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default ProjectListItem;
