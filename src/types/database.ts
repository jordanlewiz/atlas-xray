import type { Dexie } from "dexie";

// Extend Dexie with our custom tables
export interface AtlasXrayDB extends Dexie {
  projectView: Dexie.Table<any, string>;
  projectUpdates: Dexie.Table<any, string>;
  projectStatusHistory: Dexie.Table<any, string>;
  meta: Dexie.Table<any, string>;
}

// Database record types
export interface ProjectViewRecord {
  projectKey: string;
  project?: {
    name: string;
    key: string;
  };
}

export interface ProjectUpdateRecord {
  id: string;
  projectKey: string;
  creationDate?: string;
  state?: string;
  missedUpdate?: boolean;
  targetDate?: string;
  newDueDate?: string;
  oldDueDate?: string;
  oldState?: string;
  summary?: string;
  raw?: any;
}

export interface ProjectStatusHistoryRecord {
  id: string;
  projectKey: string;
  creationDate?: string;
  startDate?: string;
  targetDate?: string;
  raw?: any;
}

export interface MetaRecord {
  key: string;
  value: any;
}
