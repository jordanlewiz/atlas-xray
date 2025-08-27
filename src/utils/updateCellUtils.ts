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
  const hasMissedUpdate = Boolean(update.raw?.missedUpdate || update.missedUpdate);
  const hasDateChange = Boolean(update.oldDueDate && update.newDueDate && update.oldDueDate !== update.newDueDate);
  
  return {
    hasDateChange,
    hasMissedUpdate,
    shouldShowDateDifference: !hasMissedUpdate && hasDateChange,
    shouldShowIndicator: !hasMissedUpdate && !hasDateChange,
    cssClasses: `timeline-cell-content ${hasDateChange ? 'has-old-due-date' : ''}`,
    clickable: !hasMissedUpdate,
    oldDate: update.oldDueDate,
    newDate: update.newDueDate
  };
}