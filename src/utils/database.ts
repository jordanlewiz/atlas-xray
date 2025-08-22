import Dexie from "dexie";
import { getGlobalCloudId, getGlobalSectionId } from "./globalState";

// Database interface extending Dexie
export interface AtlasXrayDB extends Dexie {
  projectView: Dexie.Table<any, string>;
  projectStatusHistory: Dexie.Table<any, string>;
  projectUpdates: Dexie.Table<any, string>;
  projectImages: Dexie.Table<any, string>;
  meta: Dexie.Table<any, string>;
}

const db = new Dexie("AtlasXrayDB") as AtlasXrayDB;

db.version(10).stores({
  projectView: "projectKey",
  projectStatusHistory: "id,projectKey",
  projectUpdates: "id,projectKey,analyzed",
  projectImages: "id,projectKey,mediaId",
  meta: "key"
});

// Migration function to add analyzed field to existing updates
db.on('ready', async () => {
  try {
    // Check if we need to migrate existing updates
    const existingUpdates = await db.projectUpdates.toArray();
    const updatesNeedingMigration = existingUpdates.filter(update => update.analyzed === undefined);
    
    if (updatesNeedingMigration.length > 0) {
      console.log(`[AtlasXray] 🔄 Migrating ${updatesNeedingMigration.length} existing updates to add analyzed field...`);
      
              // Add analyzed field to existing updates
        for (const update of updatesNeedingMigration) {
          await db.projectUpdates.update(update.id, {
            analyzed: 0, // Mark existing updates as not analyzed (use 0 instead of false)
            analysisDate: null,
            updateQuality: null,
            qualityLevel: null,
            qualitySummary: null,
            qualityRecommendations: null,
            qualityMissingInfo: null
          });
        }
      
      console.log(`[AtlasXray] ✅ Migration complete for ${updatesNeedingMigration.length} updates`);
    }
  } catch (error) {
    console.error('[AtlasXray] ❌ Migration failed:', error);
  }
});

// ProjectView store
export async function setProjectView(projectKey: string, data: any): Promise<void> {
  // No longer store projectUrl
  await db.projectView.put({ projectKey, ...data });
}

// Meta store
export async function setMeta(key: string, value: any): Promise<void> {
  await db.meta.put({ key, value });
}

export async function getMeta(key: string): Promise<any> {
  const entry = await db.meta.get(key);
  return entry ? entry.value : null;
}

// Generic key-value helpers (backward compatibility, use meta store)
export async function setItem(key: string, value: any): Promise<void> {
  await setMeta(key, value);
}

export async function getItem(key: string): Promise<any> {
  return getMeta(key);
}

// Visible project management
async function setVisibleProjectIds(projectIds: string[]): Promise<void> {
  await setMeta('visibleProjectIds', projectIds);
}

async function getVisibleProjectIds(): Promise<string[]> {
  const ids = await getMeta('visibleProjectIds');
  return Array.isArray(ids) ? ids : [];
}

async function addVisibleProject(projectId: string): Promise<string[]> {
  const currentIds = await getVisibleProjectIds();
  if (!currentIds.includes(projectId)) {
    const newIds = [...currentIds, projectId];
    await setVisibleProjectIds(newIds);
    return newIds;
  }
  return currentIds;
}

async function getVisibleProjectCount(): Promise<number> {
  const ids = await getVisibleProjectIds();
  return ids.length;
}

// GraphQL node types
interface GraphQLNode {
  id?: string;
  uuid?: string;
  project?: {
    key?: string;
  };
  creationDate?: string;
  newState?: {
    projectStateValue?: string;
  };
  missedUpdate?: boolean;
  newTargetDate?: string;
  newDueDate?: {
    label?: string;
  };
  oldDueDate?: {
    label?: string;
  };
  oldState?: {
    projectStateValue?: string;
  };
  summary?: string;
  notes?: any[];
}



/**
 * Upsert normalized project updates into the DB.
 * @param nodes - Array of GraphQL nodes
 * @returns Promise
 */
function upsertProjectUpdates(nodes: GraphQLNode[]): Promise<string> {
  const rows = nodes.map((n) => ({
    id: n.id ?? n.uuid,
    projectKey: n.project?.key,
    creationDate: n.creationDate ? new Date(n.creationDate).toISOString() : undefined,
    state: n.newState?.projectStateValue,
    missedUpdate: !!n.missedUpdate,
    targetDate: n.newTargetDate,
    newDueDate: n.newDueDate?.label,
    oldDueDate: n.oldDueDate?.label,
    oldState: n.oldState?.projectStateValue,
    summary: n.summary,
    details: n.notes ? JSON.stringify(n.notes) : null,
    updateQuality: null, // Will be populated by AI analysis
  }));
  return db.projectUpdates.bulkPut(rows);
}



/**
 * Store project images in IndexedDB
 * @param projectKey - Project key
 * @param mediaId - Media ID from ProseMirror
 * @param imageData - Base64 encoded image data
 * @param mimeType - MIME type of the image
 * @returns Promise
 */
export async function storeProjectImage(
  projectKey: string, 
  mediaId: string, 
  imageData: string, 
  mimeType: string
): Promise<void> {
  await db.projectImages.put({
    id: `${projectKey}-${mediaId}`,
    projectKey,
    mediaId,
    imageData,
    mimeType,
    storedAt: new Date().toISOString()
  });
}

/**
 * Retrieve project image from IndexedDB
 * @param projectKey - Project key
 * @param mediaId - Media ID from ProseMirror
 * @returns Promise<{imageData: string, mimeType: string} | null>
 */
export async function getProjectImage(
  projectKey: string, 
  mediaId: string
): Promise<{imageData: string, mimeType: string} | null> {
  const image = await db.projectImages.get(`${projectKey}-${mediaId}`);
  return image ? { imageData: image.imageData, mimeType: image.mimeType } : null;
}

export { 
  db, 
  upsertProjectUpdates, 
  setVisibleProjectIds,
  getVisibleProjectIds,
  getVisibleProjectCount
};
