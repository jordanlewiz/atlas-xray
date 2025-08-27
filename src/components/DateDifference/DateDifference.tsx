import React from 'react';
import Tooltip from '@atlaskit/tooltip';
import { useDateDifference } from '../../hooks/useDateDifference';

interface DateDifferenceProps {
  oldDate: string | null | undefined;
  newDate: string | null | undefined;
  className?: string;
}

export const DateDifference = ({ oldDate, newDate, className }: DateDifferenceProps) => {
  const { displayText, cssClass, hasChange } = useDateDifference(oldDate, newDate);
  
  if (!hasChange) return null;
  
  return (
    <Tooltip content={
      <span>
        Due date changed by {displayText} days<br />
        From {oldDate} to {newDate}
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
