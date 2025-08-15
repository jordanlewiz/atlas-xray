import Dexie from "dexie";

const db = new Dexie("AtlasXrayDB");
db.version(2).stores({
  values: "key,value",
  projects: "projectId,data",
  updates: "projectId,data"
});

// Generic key-value store
export async function setItem(key, value) {
  await db.values.put({ key, value });
}

export async function getItem(key) {
  const entry = await db.values.get(key);
  return entry ? entry.value : null;
}

// Project data store
export async function setProjectData(projectId, data) {
  await db.projects.put({ projectId, data });
}

export async function getProjectData(projectId) {
  const entry = await db.projects.get(projectId);
  return entry ? entry.data : null;
}

// Updates data store
export async function setProjectUpdates(projectId, data) {
  await db.updates.put({ projectId, data });
}

export async function getProjectUpdates(projectId) {
  const entry = await db.updates.get(projectId);
  return entry ? entry.data : null;
}
