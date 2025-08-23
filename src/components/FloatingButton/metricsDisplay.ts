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
 * Format metrics for tooltip display as plain text
 * Provides full context without HTML dependencies
 */
export function formatFloatingButtonTooltip(metrics: FloatingButtonMetrics): string {
  const { projectsVisible, projectsStored, updatesAvailable, updatesStored, updatesAnalyzed } = metrics;
  
  return `Atlas Xray Status\nProjects: ${projectsVisible} in query • ${projectsStored} Total Stored\nUpdates: ${updatesAvailable} in query • ${updatesStored} Total Stored • ${updatesAnalyzed} Analyzed\nProject Fetching: Direct GraphQL API`;
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
