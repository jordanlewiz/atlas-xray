import type { Dexie } from "dexie";

// Extend Dexie with our custom tables
export interface AtlasXrayDB extends Dexie {
  projectView: Dexie.Table<any, string>;
  projectUpdates: Dexie.Table<any, string>;
  projectStatusHistory: Dexie.Table<any, string>;
  meta: Dexie.Table<any, string>;
}

// Database record types - simplified to just what we need
export interface ProjectViewRecord {
  projectKey: string;
  raw: any; // Full GraphQL response
}

export interface ProjectUpdateRecord {
  id: string;
  projectKey: string;
  raw: any; // Full GraphQL response
}

export interface ProjectStatusHistoryRecord {
  id: string;
  projectKey: string;
  raw: any; // Full GraphQL response
}

export interface MetaRecord {
  key: string;
  value: any;
}
