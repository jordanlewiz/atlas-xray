// Database record types - with individual fields for easier access
export interface ProjectSummary {
  projectKey: string; // Primary key
  name?: string;
  status?: string;
  team?: string;
  owner?: string;
  lastUpdated?: string;
  archived?: boolean;
  createdAt?: string;
  raw?: any; // Full GraphQL response for backward compatibility
}

export interface ProjectUpdate {
  uuid: string;
  projectKey: string;
  creationDate: string;
  state?: string;
  missedUpdate: boolean;
  oldState?: string;
  summary?: string;
  details?: string; // JSON stringified notes array
  raw?: any; // Full GraphQL response (optional)
  
  // NEW: Clear target date fields for consistent date handling
  newTargetDate?: string;                 // New target date (e.g., "October to December")
  newTargetDateParsed?: string;           // Parsed ISO date (e.g., "2024-12-01")
  oldTargetDate?: string;                 // Previous target date (e.g., "September")
  oldTargetDateParsed?: string;           // Parsed ISO date (e.g., "2024-09-01")
  
  // Quality analysis fields (populated by AnalysisService)
  analyzed?: boolean;
  analysisDate?: string;
  updateQuality?: number;
  qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor';
  qualitySummary?: string;
  qualityMissingInfo?: string[]; // Array of missing info (matches DatabaseService)
  qualityRecommendations?: string[]; // Array of recommendations (matches DatabaseService)
}

// NEW: Project Dependencies interface
export interface ProjectDependency {
  id: string;                    // Primary key - composite dependency ID from GraphQL
  sourceProjectKey: string;      // Project that has the dependency
  targetProjectKey: string;      // Project that is depended upon
  sourceProjectName?: string;    // For display purposes
  targetProjectName?: string;    // For display purposes
  createdAt: string;            // When dependency was discovered
  lastUpdated: string;          // When dependency was last verified
  raw?: any;                    // Full GraphQL response for backward compatibility
}

export interface ProjectStatusHistory {
  id: string;
  projectKey: string;
  creationDate?: string;
  startDate?: string;
  targetDate?: string;
  raw?: any; // Full GraphQL response (optional)
}

// Timeline data types
export interface WeekRange {
  label: string;
  start: Date;
  end: Date;
}

export interface TimelineCell {
  cellClass: string;
  weekUpdates: ProjectUpdate[];
}

export interface ProjectViewModel {
  projectKey: string;
  name: string;
  rawProject: ProjectSummary;
}

// Context types
export interface TimelineContextType {
  weekRanges: WeekRange[];
  projectViewModels: ProjectViewModel[];
  updatesByProject: Record<string, ProjectUpdate[]>;
  statusByProject: Record<string, ProjectStatusHistory[]>;
  isLoading: boolean;
}

// Component prop types
export interface StatusTimelineHeatmapProps {
  weekLimit?: number;
  visibleProjectKeys?: string[];
}

export interface StatusTimelineHeatmapRowProps {
  project: ProjectViewModel;
  weekRanges: WeekRange[];
  updates: ProjectUpdate[];
  showEmojis: boolean;
}

export interface StatusTimelineHeatmapHeaderProps {
  weekRanges: WeekRange[];
}

export interface ProjectUpdateModalProps {
  selectedUpdate: ProjectUpdate | null;
  project: ProjectViewModel;
  onClose: () => void;
}

export interface ProjectStatusHistoryModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode | ((weekLimit: number) => React.ReactNode);
}

export interface FloatingButtonProps {}

// Hook types
export interface UseTimelineDataReturn {
  weekRanges: WeekRange[];
  projectViewModels: ProjectViewModel[];
  updatesByProject: Record<string, ProjectUpdate[]>;
  statusByProject: Record<string, ProjectStatusHistory[]>;
  isLoading: boolean;
}
