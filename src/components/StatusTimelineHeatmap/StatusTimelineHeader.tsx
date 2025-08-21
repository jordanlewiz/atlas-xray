import React, { useState } from "react";
import Select from "@atlaskit/select";
import StatusLegend from "../StatusLegend";

interface StatusTimelineHeaderProps {
  weekLimit: number;
  onWeekLimitChange: (weekLimit: number) => void;
  showEmojis: boolean;
  onToggleEmojis: (showEmojis: boolean) => void;
}

/**
 * Header component for the status timeline that includes the legend, week range selector, and AI display toggle.
 */
export default function StatusTimelineHeader({ 
  weekLimit, 
  onWeekLimitChange, 
  showEmojis, 
  onToggleEmojis 
}: StatusTimelineHeaderProps): React.JSX.Element {
  const weekOptions = [
    { label: "4 weeks", value: 4 },
    { label: "8 weeks", value: 8 },
    { label: "12 weeks", value: 12 },
    { label: "16 weeks", value: 16 },
    { label: "20 weeks", value: 20 },
    { label: "24 weeks", value: 24 },
  ];

  const handleWeekLimitChange = (option: any) => {
    onWeekLimitChange(option.value);
  };

  const handleToggleEmojis = () => {
    onToggleEmojis(!showEmojis);
  };

  return (
    <div className="status-timeline-header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="timeline-title">Project Status Timeline</h2>
        </div>
        <div className="header-right">
          <div className="controls-group">
            <div className="week-selector">
              <label htmlFor="week-select" className="week-select-label">Time Range:</label>
              <Select
                inputId="week-select"
                className="week-select"
                classNamePrefix="week-select"
                options={weekOptions}
                value={weekOptions.find(opt => opt.value === weekLimit)}
                onChange={handleWeekLimitChange}
                placeholder="Select weeks"
                isSearchable={false}
              />
            </div>
            <div className="ai-display-toggle">
              <label htmlFor="emoji-toggle" className="toggle-label">Update Quality:</label>
              <button
                id="emoji-toggle"
                className={`toggle-button ${showEmojis ? 'active' : ''}`}
                onClick={handleToggleEmojis}
                type="button"
                aria-label={`Show ${showEmojis ? 'quality indicators' : 'simple indicators'} for update quality`}
              >
                <span className="toggle-text">{showEmojis ? '🎯' : '•'}</span>
                <span className="toggle-description">
                  {showEmojis ? 'Hide Quality' : 'Show Quality'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="legend-section">
        <StatusLegend />
      </div>
    </div>
  );
}
