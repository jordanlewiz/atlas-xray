import React from 'react';
import './LoadingScreen.scss';

export interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number; // 0-100
  errorMessage?: string;
}

interface LoadingScreenProps {
  isVisible: boolean;
  steps: LoadingStep[];
  overallProgress: number; // 0-100
  onClose?: () => void;
}

/**
 * Loading screen component that shows progress for data fetching steps
 */
export default function LoadingScreen({ 
  isVisible, 
  steps, 
  overallProgress, 
  onClose 
}: LoadingScreenProps): React.JSX.Element | null {
  if (!isVisible) return null;

  return (
    <div className="loading-screen-overlay">
      <div className="loading-screen-modal">
        <div className="loading-screen-header">
          <h2>Loading Atlas Xray Data</h2>
          <p>Please wait while we fetch your project information...</p>
        </div>

        {/* Overall Progress Bar */}
        <div className="overall-progress-section">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span className="progress-percentage">{Math.round(overallProgress)}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Individual Step Progress */}
        <div className="loading-steps">
          {steps.map((step) => (
            <div key={step.id} className={`loading-step ${step.status}`}>
              <div className="step-header">
                <div className="step-icon">
                  {step.status === 'pending' && <span className="icon">⏳</span>}
                  {step.status === 'loading' && <span className="icon spinning">🔄</span>}
                  {step.status === 'completed' && <span className="icon">✅</span>}
                  {step.status === 'error' && <span className="icon">❌</span>}
                </div>
                <div className="step-info">
                  <span className="step-label">{step.label}</span>
                  {step.status === 'loading' && (
                    <span className="step-progress">{Math.round(step.progress)}%</span>
                  )}
                  {step.status === 'error' && step.errorMessage && (
                    <span className="step-error">{step.errorMessage}</span>
                  )}
                </div>
              </div>
              
              {/* Step Progress Bar */}
              {step.status === 'loading' && (
                <div className="step-progress-bar">
                  <div 
                    className="step-progress-fill" 
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Close Button (only show when all steps completed) */}
        {overallProgress === 100 && onClose && (
          <div className="loading-screen-actions">
            <button 
              className="close-button"
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


