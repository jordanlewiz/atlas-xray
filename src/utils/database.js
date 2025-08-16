import Dexie from "dexie";

const db = new Dexie("AtlasXrayDB");
db.version(6).stores({
  projectView: "projectKey",
  projectStatusHistory: "projectKey",
  projectUpdates: "projectKey",
  meta: "key"
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
