/**
 * Version Service - Handles extension version checking and update notifications
 * Restored from original working VersionChecker implementation
 * Follows architecture principles: singleton pattern, clear responsibilities
 */

// Chrome extension types
declare const chrome: any;

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  body: string;
  published_at: string;
}

export interface VersionInfo {
  hasUpdate: boolean;
  latestVersion?: string;
  releaseUrl?: string;
}

/**
 * Version Service for checking extension updates
 * Implements singleton pattern as per architecture principles
 * Maintains exact same functionality as original VersionChecker
 */
export class VersionService {
  private static instance: VersionService;
  private readonly GITHUB_API_URL = 'https://api.github.com/repos/jordanlewiz/atlas-xray/releases/latest';
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly STORAGE_KEY = 'lastVersionCheck';
  
  // Static map to store notification ID to release URL mapping
  private readonly notificationReleaseUrls = new Map<string, string>();
  
  // Static flag to ensure listener is registered only once
  private isListenerRegistered = false;
  
  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): VersionService {
    if (!VersionService.instance) {
      VersionService.instance = new VersionService();
    }
    return VersionService.instance;
  }

  /**
   * Check if current version is a local development build
   */
  isLocalDevVersion(): boolean {
    const currentVersion = chrome.runtime.getManifest().version;
    
    // Local dev versions typically have patterns like:
    // - 0.0.0 (default version - Chrome allows this)
    // - 0.0.1-dev (Chrome doesn't allow this)
    // - 0.0.1-local (Chrome doesn't allow this)
    // - 0.0.1+dev (Chrome doesn't allow this)
    return currentVersion === '0.0.0';
  }
  
  /**
   * Get version type description
   */
  getVersionType(): string {
    if (this.isLocalDevVersion()) {
      return 'Local Development Build';
    }
    return 'Release Version';
  }

  /**
   * Get latest version information (no rate limiting)
   */
  async getLatestVersionInfo(): Promise<VersionInfo> {
    try {
      // Fetch latest release from GitHub
      const response = await fetch(this.GITHUB_API_URL);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release: GitHubRelease = await response.json();
      const latestVersion = release.tag_name.replace(/^v/, '');
      const currentVersion = chrome.runtime.getManifest().version;

      // Compare versions
      if (this.isNewerVersion(latestVersion, currentVersion)) {
        return {
          hasUpdate: true,
          latestVersion: release.tag_name,
          releaseUrl: release.html_url
        };
      }

      return { 
        hasUpdate: false, 
        latestVersion: release.tag_name 
      };
    } catch (error) {
      console.warn('[AtlasXray] Version info fetch failed:', error);
      return { hasUpdate: false };
    }
  }

  /**
   * Check if a new version is available (with rate limiting)
   */
  async checkForUpdates(): Promise<VersionInfo> {
    try {
      // Check if we should perform the check (avoid checking too frequently)
      const lastCheck = await this.getLastCheckTime();
      const now = Date.now();
      
      if (now - lastCheck < this.CHECK_INTERVAL) {
        // Rate limited - don't make API call
        return { hasUpdate: false };
      }

      // Fetch latest release from GitHub
      const response = await fetch(this.GITHUB_API_URL);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release: GitHubRelease = await response.json();
      const latestVersion = release.tag_name.replace(/^v/, '');
      const currentVersion = chrome.runtime.getManifest().version;

      // Update last check time
      await this.setLastCheckTime(now);

      // Compare versions
      if (this.isNewerVersion(latestVersion, currentVersion)) {
        return {
          hasUpdate: true,
          latestVersion: release.tag_name,
          releaseUrl: release.html_url
        };
      }

      return { 
        hasUpdate: false, 
        latestVersion: release.tag_name 
      };
    } catch (error) {
      console.warn('[AtlasXray] Version check failed:', error);
      return { hasUpdate: false };
    }
  }

  /**
   * Compare two semantic versions
   */
  private isNewerVersion(latest: string, current: string): boolean {
    const l = latest.split('.').map(part => parseInt(part, 10) || 0);
    const c = current.split('.').map(part => parseInt(part, 10) || 0);
    
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
      const lNum = (l[i] || 0);
      const cNum = (c[i] || 0);
      
      if (lNum > cNum) return true;
      if (lNum < cNum) return false;
    }
    
    return false;
  }

  /**
   * Get the last time we checked for updates
   */
  private async getLastCheckTime(): Promise<number> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Set the last check time
   */
  private async setLastCheckTime(timestamp: number): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: timestamp });
    } catch (error) {
      console.warn('[AtlasXray] Failed to save check time:', error);
    }
  }

  /**
   * Register notification click listener (called only once)
   */
  private registerNotificationListener(): void {
    if (this.isListenerRegistered) return;
    
    chrome.notifications.onClicked.addListener((id: string) => {
      const releaseUrl = this.notificationReleaseUrls.get(id);
      if (releaseUrl) {
        chrome.tabs.create({ url: releaseUrl });
        chrome.notifications.clear(id);
        this.notificationReleaseUrls.delete(id);
      }
    });
    
    this.isListenerRegistered = true;
  }

  /**
   * Clean up notification mapping (called when notification is cleared)
   */
  cleanupNotification(notificationId: string): void {
    this.notificationReleaseUrls.delete(notificationId);
  }

  /**
   * Show update notification to user
   */
  async showUpdateNotification(latestVersion: string, releaseUrl: string): Promise<void> {
    try {
      // Ensure listener is registered
      this.registerNotificationListener();
      
      // Create notification
      const notificationId = `atlas-xray-update-${Date.now()}`;
      
      // Store mapping for notification click handler
      this.notificationReleaseUrls.set(notificationId, releaseUrl);
      
      await chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
        title: 'Atlas Xray Update Available',
        message: `A new version (${latestVersion}) is available! Click to download.`,
        priority: 1
      });

      // Auto-clear notification after 10 seconds using chrome.alarms
      chrome.alarms.create(`atlas-xray-clear-${notificationId}`, { when: Date.now() + 10000 });

    } catch (error) {
      console.warn('[AtlasXray] Failed to show update notification:', error);
      
      // Fallback: open update page directly if notification fails
      chrome.tabs.create({ url: releaseUrl });
      console.warn(`[AtlasXray] A new version (${latestVersion}) is available. Opening update page: ${releaseUrl}`);
    }
  }
}

// Export singleton instance
export const versionService = VersionService.getInstance();

// Export individual functions for backward compatibility
export const checkForUpdates = () => versionService.checkForUpdates();
export const getLatestVersionInfo = () => versionService.getLatestVersionInfo();
export const showUpdateNotification = (version: string, releaseUrl: string) => 
  versionService.showUpdateNotification(version, releaseUrl);
export const cleanupNotification = (notificationId: string) => 
  versionService.cleanupNotification(notificationId);
