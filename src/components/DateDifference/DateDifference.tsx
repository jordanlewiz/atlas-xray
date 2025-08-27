import React from 'react';
import Tooltip from '@atlaskit/tooltip';
import { useDateDifference } from '../../hooks/useDateDifference';
import { normalizeDateForDisplay } from '../../utils/timelineUtils';

interface DateDifferenceProps {
  oldDate: string | null | undefined;
  newDate: string | null | undefined;
  className?: string;
}

export const DateDifference = ({ oldDate, newDate, className }: DateDifferenceProps) => {
  const { displayText, cssClass, hasChange } = useDateDifference(oldDate, newDate);
  
  if (!hasChange) return null;
  
  const normalizedOldDate = normalizeDateForDisplay(oldDate);
  const normalizedNewDate = normalizeDateForDisplay(newDate);
  
  return (
    <Tooltip content={
      <span>
        Due date changed by {displayText} days<br />
        From {normalizedOldDate} to {normalizedNewDate}
      </span>
    } position="top">
      <span 
        className={`date-difference ${cssClass} ${className || ''}`}
        data-testid="date-difference"
      >
        {displayText}
      </span>
    </Tooltip>
  );
};
