import Dexie from "dexie";

const db = new Dexie("AtlasXrayDB");
db.version(6).stores({
  projectView: "projectKey",
  projectStatusHistory: "projectKey",
  projectUpdates: "projectKey",
  updates: "updateId, projectKey, updatedAt, [projectKey+updatedAt]",
  views: "projectKey",
  meta: "key",
  projectIds: "projectId" // new table for project IDs
});

// ProjectView store
export async function setProjectView(projectKey, data) {
  await db.projectView.put({ projectKey, ...data });
}
export async function getProjectView(projectKey) {
  return db.projectView.get(projectKey);
}

// ProjectStatusHistory store
export async function setProjectStatusHistory(projectKey, data) {
  await db.projectStatusHistory.put({ projectKey, ...data });
}
export async function getProjectStatusHistory(projectKey) {
  return db.projectStatusHistory.get(projectKey);
}

// ProjectUpdates store (full updates query result per project)
export async function setProjectUpdates(projectKey, data) {
  await db.projectUpdates.put({ projectKey, ...data });
}
export async function getProjectUpdates(projectKey) {
  return db.projectUpdates.get(projectKey);
}

// Updates store (individual update records from updates.edges)
export async function setUpdate(update) {
  await db.updates.put(update);
}
export async function getUpdatesByProject(projectKey) {
  return db.updates.where("projectKey").equals(projectKey).toArray();
}

// Views store
export async function setView(projectKey, data) {
  await db.views.put({ projectKey, ...data });
}
export async function getView(projectKey) {
  return db.views.get(projectKey);
}

// Meta store
export async function setMeta(key, value) {
  await db.meta.put({ key, value });
}
export async function getMeta(key) {
  const entry = await db.meta.get(key);
  return entry ? entry.value : null;
}

// Generic key-value helpers (backward compatibility, use meta store)
export async function setItem(key, value) {
  await setMeta(key, value);
}
export async function getItem(key) {
  console.log('[AtlasXray] getItem', key);
  return getMeta(key);
}

// ProjectIds table
export async function addProjectId(projectId) {
  await db.projectIds.put({ projectId });
}
export async function getAllProjectIds() {
  return db.projectIds.toArray();
}
