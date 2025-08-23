import Dexie, { Table } from 'dexie';

// Simple database interface - just what we need
export interface ProjectView {
  projectKey: string; // Primary key
  name?: string;
  status?: string;
  team?: string;
  owner?: string;
  lastUpdated?: string;
  archived?: boolean;
  createdAt?: string;
}

export interface ProjectUpdate {
  uuid: string; // Primary key from GraphQL
  projectKey: string;
  creationDate: string;
  state?: string;
  missedUpdate: boolean;
  targetDate?: string;
  newDueDate?: string;
  oldDueDate?: string;
  oldState?: string;
  summary?: string;
  details?: string;
  // Analysis results stored directly in the update
  updateQuality?: number;
  qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor';
  qualitySummary?: string;
  qualityMissingInfo?: string[];
  qualityRecommendations?: string[];
  analyzed?: boolean;
  analysisDate?: string;
}

export interface MetaData {
  key: string;
  value: string;
  lastUpdated: string;
}

// Simple database class
export class AtlasXrayDB extends Dexie {
  projectViews!: Table<ProjectView>;
  projectUpdates!: Table<ProjectUpdate>;
  meta!: Table<MetaData>;

  constructor() {
    super('AtlasXrayDB');
    
          this.version(1).stores({
        projectViews: 'projectKey', // projectKey as primary key
        projectUpdates: 'uuid, projectKey, creationDate', // UUID as primary key with indexes
        meta: 'key'
      });
  }
}

// Create and export database instance
export const db = new AtlasXrayDB();

// Simple utility functions
export async function storeProjectView(view: ProjectView): Promise<void> {
  await db.projectViews.put(view);
}

export async function storeProjectUpdate(update: ProjectUpdate): Promise<void> {
  await db.projectUpdates.put(update);
}

export async function getVisibleProjectCount(): Promise<number> {
  return await db.projectViews.count();
}

export async function getUpdatesCount(): Promise<number> {
  return await db.projectUpdates.count();
}

export async function getAnalyzedUpdatesCount(): Promise<number> {
  return await db.projectUpdates.where('analyzed').equals(1).count();
}

export async function getMetaValue(key: string): Promise<string | null> {
  const meta = await db.meta.get(key);
  return meta?.value || null;
}

export async function setMetaValue(key: string, value: string): Promise<void> {
  await db.meta.put({
    key,
    value,
    lastUpdated: new Date().toISOString()
  });
}

// Visible project management
export async function setVisibleProjectIds(projectIds: string[]): Promise<void> {
  await setMetaValue('visibleProjectIds', JSON.stringify(projectIds));
}

export async function getVisibleProjectIds(): Promise<string[]> {
  const ids = await getMetaValue('visibleProjectIds');
  return ids ? JSON.parse(ids) : [];
}

export default db;

// Backward compatibility exports
export async function getProjectImage(
  projectKey: string, 
  mediaId: string
): Promise<{imageData: string, mimeType: string} | null> {
  // Not implemented in new schema
  return null;
}

export async function upsertProjectUpdates(nodes: any[]): Promise<string> {
  // Legacy function - now just calls storeProjectUpdate for each node
  try {
    for (const node of nodes) {
      const update = {
        uuid: node.uuid || node.id || `update_${Date.now()}_${Math.random()}`, // Use UUID or generate fallback
        projectKey: node.project?.key || node.projectKey,
        creationDate: node.creationDate ? new Date(node.creationDate).toISOString() : new Date().toISOString(),
        state: node.newState?.projectStateValue,
        missedUpdate: !!node.missedUpdate,
        targetDate: node.newTargetDate,
        newDueDate: node.newDueDate?.label,
        oldDueDate: node.oldDueDate?.label,
        oldState: node.oldState?.projectStateValue,
        summary: node.summary || '',
        details: node.notes ? JSON.stringify(node.notes) : undefined,
        analyzed: false
      };
      await storeProjectUpdate(update);
    }
    return `Successfully stored ${nodes.length} project updates`;
  } catch (error) {
    console.error('Error storing project updates:', error);
    throw error;
  }
}
