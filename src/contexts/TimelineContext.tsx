import React, { createContext, useContext } from "react";
import { useTimelineData } from "../hooks/useTimelineData";
import type { TimelineContextType } from "../types";

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

interface TimelineProviderProps {
  children: React.ReactNode;
  weekLimit: number;
}

export function TimelineProvider({ children, weekLimit }: TimelineProviderProps): React.JSX.Element {
  const timelineData = useTimelineData(weekLimit);

  return (
    <TimelineContext.Provider value={timelineData}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimelineContext(): TimelineContextType {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
}
