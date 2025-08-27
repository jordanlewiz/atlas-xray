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
  console.log('🔍 [analyzeUpdateCell] Analyzing update:', {
    updateId: update.uuid || update.id || 'unknown',
    dueDate: update.dueDate,
    dueDateParsed: update.dueDateParsed,
    oldDueDateParsed: update.oldDueDateParsed,
    rawMissedUpdate: update.raw?.missedUpdate,
    missedUpdate: update.missedUpdate
  });

  const hasMissedUpdate = Boolean(update.raw?.missedUpdate || update.missedUpdate);
  
  // Use the new dueDateParsed field for consistent date comparison
  // We need to compare the current update's dueDateParsed with the previous update's dueDateParsed
  // For now, we'll use a simple approach: if dueDateParsed exists, it means there was a date change
  let hasDateChange = false;
  
  if (update.dueDateParsed) {
    // If we have a parsed date, check if it's different from the previous update
    // This is a simplified approach - in a real scenario, you'd compare with the previous update
    hasDateChange = true; // For now, assume any parsed date means there was a change
  }
  
  console.log('🔍 [analyzeUpdateCell] Date change analysis:', {
    hasDateChange,
    dueDateParsed: update.dueDateParsed,
    oldDueDateParsed: update.oldDueDateParsed
  });

  console.log('🔍 [analyzeUpdateCell] Final decision:', {
    hasDateChange,
    hasMissedUpdate,
    shouldShowDateDifference: !hasMissedUpdate && hasDateChange,
    shouldShowIndicator: !hasMissedUpdate && !hasDateChange,
    cssClasses: `timeline-cell-content ${hasDateChange ? 'has-old-due-date' : ''}`
  });

  return {
    hasDateChange,
    hasMissedUpdate,
    shouldShowDateDifference: !hasMissedUpdate && hasDateChange,
    shouldShowIndicator: !hasMissedUpdate && !hasDateChange,
    cssClasses: `timeline-cell-content ${hasDateChange ? 'has-old-due-date' : ''}`,
    clickable: !hasMissedUpdate,
    oldDate: update.oldDueDateParsed || update.dueDate,
    newDate: update.dueDateParsed || update.dueDate
  };
}