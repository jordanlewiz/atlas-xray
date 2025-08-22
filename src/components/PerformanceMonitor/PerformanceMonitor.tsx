import React, { useState, useEffect } from 'react';
import './PerformanceMonitor.scss';

interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
  timestamp: number;
}

interface PerformanceData {
  memory: MemoryStats | null;
  analysisQueue: number;
  activeAnalyses: number;
  cacheSize: number;
  lastCleanup: string;
}

const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    memory: null,
    analysisQueue: 0,
    activeAnalyses: 0,
    cacheSize: 0,
    lastCleanup: 'Never'
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      const interval = setInterval(refreshPerformanceData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isMonitoring]);

  const refreshPerformanceData = async () => {
    try {
      // Get memory stats from background script
      const response = await chrome.runtime.sendMessage({ type: 'GET_MEMORY_STATS' });
      if (response.success) {
        setPerformanceData(prev => ({
          ...prev,
          memory: response.stats,
          lastCleanup: response.lastCleanup || prev.lastCleanup
        }));
      }
    } catch (error) {
      console.warn('Failed to get performance data:', error);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    refreshPerformanceData();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setAutoRefresh(false);
  };

  const forceCleanup = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'FORCE_CLEANUP' });
      if (response.success) {
        setPerformanceData(prev => ({
          ...prev,
          lastCleanup: new Date().toLocaleTimeString()
        }));
        // Refresh data after cleanup
        setTimeout(refreshPerformanceData, 2000);
      }
    } catch (error) {
      console.error('Failed to force cleanup:', error);
    }
  };

  const getMemoryStatus = (percentage: number) => {
    if (percentage < 50) return { status: 'healthy', color: '#4caf50' };
    if (percentage < 75) return { status: 'warning', color: '#ff9800' };
    return { status: 'critical', color: '#f44336' };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h3>System Performance</h3>
        <div className="monitor-controls">
          {!isMonitoring ? (
            <button 
              className="btn-start" 
              onClick={startMonitoring}
            >
              Start Monitoring
            </button>
          ) : (
            <button 
              className="btn-stop" 
              onClick={stopMonitoring}
            >
              Stop Monitoring
            </button>
          )}
          <label className="auto-refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              disabled={!isMonitoring}
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {isMonitoring && (
        <div className="monitor-content">
          {/* Memory Usage */}
          {performanceData.memory && (
            <div className="metric-section">
              <h4>Memory Usage</h4>
              <div className="memory-display">
                <div className="memory-bar">
                  <div 
                    className="memory-fill"
                    style={{
                      width: `${performanceData.memory.percentage}%`,
                      backgroundColor: getMemoryStatus(performanceData.memory.percentage).color
                    }}
                  />
                </div>
                <div className="memory-stats">
                  <span className="percentage">
                    {performanceData.memory.percentage.toFixed(1)}%
                  </span>
                  <span className="details">
                    {formatBytes(performanceData.memory.used * 1024 * 1024)} / {formatBytes(performanceData.memory.limit * 1024 * 1024)}
                  </span>
                </div>
                <span className={`status ${getMemoryStatus(performanceData.memory.percentage).status}`}>
                  {getMemoryStatus(performanceData.memory.percentage).status.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="metric-section">
            <h4>System Status</h4>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Analysis Queue:</span>
                <span className="value">{performanceData.analysisQueue}</span>
              </div>
              <div className="status-item">
                <span className="label">Active Analyses:</span>
                <span className="value">{performanceData.activeAnalyses}</span>
              </div>
              <div className="status-item">
                <span className="label">Cache Size:</span>
                <span className="value">{performanceData.cacheSize}</span>
              </div>
              <div className="status-item">
                <span className="label">Last Cleanup:</span>
                <span className="value">{performanceData.lastCleanup}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="actions-section">
            <button 
              className="btn-cleanup"
              onClick={forceCleanup}
              disabled={!performanceData.memory || performanceData.memory.percentage < 50}
            >
              Force Cleanup
            </button>
            <button 
              className="btn-refresh"
              onClick={refreshPerformanceData}
            >
              Refresh Data
            </button>
          </div>

          {/* Recommendations */}
          {performanceData.memory && performanceData.memory.percentage > 75 && (
            <div className="recommendations">
              <h4>⚠️ High Memory Usage Detected</h4>
              <ul>
                <li>Close unnecessary browser tabs</li>
                <li>Restart the extension if problems persist</li>
                <li>Consider reducing the number of concurrent analyses</li>
                <li>Check for memory leaks in the console</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {!isMonitoring && (
        <div className="monitor-placeholder">
          <p>Click "Start Monitoring" to view system performance metrics</p>
          <p className="note">
            This helps identify potential performance issues before they cause crashes
          </p>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
