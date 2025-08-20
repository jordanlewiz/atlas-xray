import React from 'react';
import Tooltip from '@atlaskit/tooltip';

export interface QualityIndicatorProps {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  size?: 'small' | 'medium' | 'large';
  showScore?: boolean;
  className?: string;
}

/**
 * Quality indicator component that displays quality scores with emojis
 */
export default function QualityIndicator({ 
  score, 
  level, 
  size = 'medium',
  showScore = false,
  className = ''
}: QualityIndicatorProps): React.JSX.Element {
  
  // Get emoji and color based on quality level
  const getQualityDisplay = () => {
    switch (level) {
      case 'excellent':
        return { emoji: '🟢', color: '#22c55e', label: 'Excellent' };
      case 'good':
        return { emoji: '🟡', color: '#eab308', label: 'Good' };
      case 'fair':
        return { emoji: '🟠', color: '#f97316', label: 'Fair' };
      case 'poor':
        return { emoji: '🔴', color: '#ef4444', label: 'Poor' };
      default:
        return { emoji: '⚪', color: '#6b7280', label: 'Unknown' };
    }
  };

  const { emoji, color, label } = getQualityDisplay();
  
  // Size classes
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const tooltipContent = (
    <div className="p-2">
      <div className="font-semibold mb-1">{label} Quality</div>
      <div className="text-sm">Score: {Math.round(score)}%</div>
      <div className="text-xs text-gray-500 mt-1">
        {score >= 90 && 'Comprehensive information provided'}
        {score >= 75 && score < 90 && 'Good information, some gaps'}
        {score >= 50 && score < 75 && 'Fair information, several gaps'}
        {score < 50 && 'Limited information, significant gaps'}
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top">
      <div 
        className={`quality-indicator ${sizeClasses[size]} ${className}`}
        style={{ color }}
      >
        <span className="quality-emoji" role="img" aria-label={`${label} quality`}>
          {emoji}
        </span>
        {showScore && (
          <span className="quality-score ml-1">
            {Math.round(score)}%
          </span>
        )}
      </div>
    </Tooltip>
  );
}
