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
  targetDate?: string;
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
export interface ProjectTimelineProps {
  projects: ProjectViewModel[];
  weekRanges: WeekRange[];
  updatesByProject: Record<string, ProjectUpdate[]>;
}

export interface ProjectTimelineRowProps {
  project: ProjectViewModel;
  weekRanges: WeekRange[];
  updates: ProjectUpdate[];
}

export interface ProjectTimelineHeaderProps {
  weekRanges: WeekRange[];
}

export interface DateChangeModalProps {
  selectedUpdate: ProjectUpdate | null;
  project: ProjectViewModel;
  onClose: () => void;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode | ((weekLimit: number) => React.ReactNode);
}

export interface FloatingButtonProps {}

// New component interfaces
export interface ProjectListProps {
  weekLimit?: number;
}

// Hook types
export interface UseTimelineDataReturn {
  weekRanges: WeekRange[];
  projectViewModels: ProjectViewModel[];
  updatesByProject: Record<string, ProjectUpdate[]>;
  statusByProject: Record<string, ProjectStatusHistory[]>;
  isLoading: boolean;
}
