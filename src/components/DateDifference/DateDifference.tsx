import React from 'react';
import Tooltip from '@atlaskit/tooltip';
import { useDateDifference } from '../../hooks/useDateDifference';
import type { ProjectUpdate } from '../../types';

interface DateDifferenceProps {
  update: ProjectUpdate;
  className?: string;
}

export const DateDifference = ({ update, className }: DateDifferenceProps) => {
  const { displayText, cssClass, hasChange } = useDateDifference(update);
  
  if (!hasChange) return null;
  
  return (
    <Tooltip content={`Due date changed by ${displayText} days`} position="top">
      <span 
        className={`date-difference ${cssClass} ${className || ''}`}
        data-testid="date-difference"
      >
        {displayText}
      </span>
    </Tooltip>
  );
};
