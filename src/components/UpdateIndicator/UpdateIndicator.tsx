import React from 'react';
import QualityIndicator from '../QualityIndicator/QualityIndicator';

interface UpdateIndicatorProps {
  update: any;
  showEmojis: boolean;
  className?: string;
}

/**
 * Renders the appropriate indicator for a project update
 * Shows quality indicator, pending analysis, or simple bullet based on state
 */
export const UpdateIndicator = ({ update, showEmojis, className }: UpdateIndicatorProps) => {
  if (showEmojis && update.uuid) {
    // Show quality indicator when toggle is on and analysis is complete
    if (update.updateQuality !== undefined && update.qualityLevel) {
      return (
        <QualityIndicator
          score={update.updateQuality}
          level={update.qualityLevel}
          size="small"
          className={`quality-indicator-timeline ${className || ''}`}
        />
      );
    }
    
    // Show pending analysis indicator when toggle is on but analysis not complete
    return (
      <span 
        className={`update-indicator pending-analysis ${className || ''}`}
        data-testid="update-indicator-pending"
        title="Analysis in progress..."
        style={{
          backgroundColor: '#ffab00',
          animation: 'pulse 2s infinite'
        }}
      />
    );
  }
  
  // Show white bullet when toggle is off
  return (
    <span 
      className={`update-indicator ${className || ''}`}
      data-testid="update-indicator"
      title="Project update"
    />
  );
};
