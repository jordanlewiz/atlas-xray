import React, { createContext, useContext } from "react";
import { useTimelineData } from "../hooks/useTimelineData";

const TimelineContext = createContext();

export function TimelineProvider({ children, weekLimit }) {
  const timelineData = useTimelineData(weekLimit);
  
  return (
    <TimelineContext.Provider value={timelineData}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimelineContext() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
}
