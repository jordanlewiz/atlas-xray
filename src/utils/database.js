import Dexie from "dexie";

const db = new Dexie("AtlasXrayDB");
db.version(8).stores({
  projectView: "projectKey",
  projectStatusHistory: "id,projectKey",
  projectUpdates: "id,projectKey",
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

export async function getProjectViewCount() {
  return db.projectView.count();
}

/**
 * Upsert normalized project updates into the DB.
 * @param {any[]} nodes
 * @returns {Promise}
 */
function upsertProjectUpdates(nodes) {
  const rows = nodes.map((n) => ({
    id: n.id ?? n.uuid,
    projectKey: n.project?.key,
    creationDate: n.creationDate,
    state: n.newState?.value,
    missedUpdate: !!n.missedUpdate,
    targetDate: n.newTargetDate,
    raw: n,
  }));
  return db.projectUpdates.bulkPut(rows);
}

/**
 * Upsert normalized project status history into the DB.
 * @param {any[]} nodes
 * @returns {Promise}
 */
function upsertProjectStatusHistory(nodes, projectKey) {
  if (!projectKey) {
    console.warn('[AtlasXray] upsertProjectStatusHistory called with undefined projectKey. Skipping.');
    return Promise.resolve();
  }
  console.log('[AtlasXray] upsertProjectStatusHistory', nodes, projectKey);
  const rows = nodes.map((n) => ({
    id: n.id ?? n.uuid,
    projectKey: projectKey,
    creationDate: n.creationDate,
    startDate: n.startDate,
    targetDate: n.targetDate,
    raw: n,
  }));
  return db.projectStatusHistory.bulkPut(rows);
}

export { db, upsertProjectUpdates, upsertProjectStatusHistory };
