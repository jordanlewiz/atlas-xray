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
