import React from 'react';
import Tooltip from '@atlaskit/tooltip';
import { DateDifference } from '../DateDifference';
import { UpdateIndicator } from '../UpdateIndicator';
import type { UpdateCellAnalysis } from '../../utils/updateCellUtils';

interface UpdateCellContentProps {
  analysis: UpdateCellAnalysis;
  showEmojis: boolean;
  update: any;
  onUpdateClick: (update: any) => void;
}

/**
 * Renders the content of a single update cell in the timeline
 * Shows either a date difference or an update indicator based on analysis
 */
export const UpdateCellContent = ({ 
  analysis, 
  showEmojis, 
  update, 
  onUpdateClick 
}: UpdateCellContentProps) => {
  return (
    <div 
      className={analysis.cssClasses}
      onClick={analysis.clickable ? () => onUpdateClick(update) : undefined}
      style={{ cursor: analysis.clickable ? 'pointer' : 'default' }}
    >
      {analysis.shouldShowDateDifference && (
        <DateDifference oldDate={analysis.oldDate} newDate={analysis.newDate} />
      )}
      
      {analysis.shouldShowIndicator && (
        <Tooltip content="Click to view update details" position="top">
          <UpdateIndicator update={update} showEmojis={showEmojis} />
        </Tooltip>
      )}
    </div>
  );
};
