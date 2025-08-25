/**
 * Metrics display utilities specifically for FloatingButton component
 * Provides formatted display options for project and update metrics
 */

export interface FloatingButtonMetrics {
  projectsVisible: number;
  projectsStored: number;
  updatesAvailable: number;
  updatesStored: number;
  updatesAnalyzed: number;
}

/**
 * Format metrics for HTML display in floating button
 * Uses HTML formatting with strong tags for better visual hierarchy
 */
export function formatFloatingButtonMetrics(metrics: FloatingButtonMetrics): string {
  const { projectsVisible, projectsStored, updatesAvailable, updatesStored, updatesAnalyzed } = metrics;
  
  // Projects and updates on separate lines with HTML formatting
  const projectsLine = `<strong>Projects:</strong> ${projectsVisible} in query • ${projectsStored} Total Stored`;
  const updatesLine = `<strong>Updates:</strong> ${updatesAvailable} in query • ${updatesStored} Total Stored • ${updatesAnalyzed} Analyzed`;
  
  return `${projectsLine}\n${updatesLine}`;
}

/**
 * Format metrics for tooltip display - matches HTML button format exactly
 * Uses same structure as button display for consistency
 */
export function formatFloatingButtonTooltip(metrics: FloatingButtonMetrics): string {
  const { projectsVisible, projectsStored, updatesAvailable, updatesStored, updatesAnalyzed } = metrics;
  
  // Match the exact format used in the button display
  const projectsLine = `Projects: ${projectsVisible} in query • ${projectsStored} Total Stored`;
  const updatesLine = `Updates: ${updatesAvailable} in query • ${updatesStored} Total Stored • ${updatesAnalyzed} Analyzed`;
  
  return `${projectsLine}\n${updatesLine}`;
}

/**
 * Format metrics for compact display (alternative format)
 * Single line format for space-constrained situations
 */
export function formatCompactMetrics(metrics: FloatingButtonMetrics): string {
  const { projectsVisible, projectsStored, updatesAvailable, updatesStored, updatesAnalyzed } = metrics;
  
  return `${projectsVisible} projects • ${projectsStored} stored • ${updatesAvailable} available • ${updatesStored} total • ${updatesAnalyzed} analyzed`;
}

/**
 * Format metrics for minimal display
 * Most concise format for limited space
 */
export function formatMinimalMetrics(metrics: FloatingButtonMetrics): string {
  const { projectsVisible, projectsStored, updatesAvailable, updatesStored, updatesAnalyzed } = metrics;
  
  return `👁️${projectsVisible} 💾${projectsStored} 📥${updatesAvailable} 📊${updatesStored} ✅${updatesAnalyzed}`;
}
