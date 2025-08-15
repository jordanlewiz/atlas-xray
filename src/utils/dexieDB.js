import Dexie from "dexie";

const db = new Dexie("AtlasXrayDB");
db.version(4).stores({
  projects: "projectKey", // one row per project
  statusHistory: "projectKey", // one row per project status history
  projectUpdates: "projectKey", // one row per project updates
  updates: "updateId, projectKey, updatedAt, [projectKey+updatedAt]", // one row per update, with indexes
  views: "projectKey", // cached per-project computed views
  meta: "key" // sync info, feature flags, schema version
});

// Projects store
export async function setProject(projectKey, data) {
  await db.projects.put({ projectKey, ...data });
}
export async function getProject(projectKey) {
  return db.projects.get(projectKey);
}

// StatusHistory store
export async function setStatusHistory(projectKey, data) {
  await db.statusHistory.put({ projectKey, ...data });
}
export async function getStatusHistory(projectKey) {
  return db.statusHistory.get(projectKey);
}

// ProjectUpdates store
export async function setProjectUpdates(projectKey, data) {
  await db.projectUpdates.put({ projectKey, ...data });
}
export async function getProjectUpdates(projectKey) {
  return db.projectUpdates.get(projectKey);
}

// Updates store (individual updates)
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
  return getMeta(key);
}
