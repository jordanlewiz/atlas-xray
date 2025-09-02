import { log, setFilePrefix } from './logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[TimelineCellUpdates]');

export interface UpdateCellAnalysis {
  hasDateChange: boolean;
  hasMissedUpdate: boolean;
  shouldShowDateDifference: boolean;
  shouldShowIndicator: boolean;
  cssClasses: string;
  clickable: boolean;
  oldDate?: string;
  newDate?: string;
}

/**
 * Analyzes an update to determine how it should be displayed in a timeline cell
 * @param update - The project update object
 * @returns Analysis object with display logic decisions
 */
export function analyzeUpdateCell(update: any): UpdateCellAnalysis {
  // Add comprehensive logging for debugging
  log.debug('Analyzing update:', JSON.stringify({
    updateId: update.uuid || update.id || 'unknown',
    newTargetDate: update.newTargetDate,
    newTargetDateParsed: update.newTargetDateParsed,
    oldTargetDate: update.oldTargetDate,
    oldTargetDateParsed: update.oldTargetDateParsed,
    rawMissedUpdate: update.raw?.missedUpdate,
    missedUpdate: update.missedUpdate
  }));

  const hasMissedUpdate = Boolean(update.raw?.missedUpdate || update.missedUpdate);
  
  // Check if there's a date change by comparing parsed target dates ONLY
  const hasDateChange = Boolean(
    update.oldTargetDateParsed && 
    update.newTargetDateParsed && 
    update.oldTargetDateParsed !== update.newTargetDateParsed
  );
  
  log.debug('Date change analysis:', JSON.stringify({
    hasDateChange,
    oldTargetDate: update.oldTargetDate,
    newTargetDate: update.newTargetDate,
    datesAreDifferent: update.oldTargetDate !== update.newTargetDate
  }));

  log.debug('Final decision:', JSON.stringify({
    hasDateChange,
    hasMissedUpdate,
    shouldShowDateDifference: !hasMissedUpdate && hasDateChange,
    shouldShowIndicator: !hasMissedUpdate && !hasDateChange,
    cssClasses: `timeline-cell-content ${hasDateChange ? 'has-old-due-date' : ''}`
  }));

  return {
    hasDateChange,
    hasMissedUpdate,
    shouldShowDateDifference: !hasMissedUpdate && hasDateChange,
    shouldShowIndicator: !hasMissedUpdate && !hasDateChange,
    cssClasses: `timeline-cell-content ${hasDateChange ? 'has-old-due-date' : ''}`,
    clickable: !hasMissedUpdate,
    oldDate: update.oldTargetDateParsed,
    newDate: update.newTargetDateParsed
  };
}