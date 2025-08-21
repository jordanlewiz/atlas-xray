// Database record types - with individual fields for easier access
export interface ProjectView {
  projectKey: string;
  raw: any; // Full GraphQL response
}

export interface ProjectUpdate {
  id: string;
  projectKey: string;
  creationDate?: string;
  state?: string;
  missedUpdate?: boolean;
  targetDate?: string; // Maps to newTargetDate from GraphQL
  newDueDate?: string;
  oldDueDate?: string;
  oldState?: string;
  summary?: string;
  details?: string; // JSON stringified notes array
  raw?: any; // Full GraphQL response (optional)
  // Quality analysis fields (populated by local language model)
  analyzed?: boolean;
  analysisDate?: string;
  updateQuality?: number;
  qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor';
  qualityAnalysis?: string; // JSON string of detailed analysis
  qualitySummary?: string;
  qualityRecommendations?: string; // JSON string of recommendations
  qualityMissingInfo?: string; // JSON string of missing information
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
  rawProject: ProjectView;
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
