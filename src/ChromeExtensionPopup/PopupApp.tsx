/**
 * Atlas Xray Chrome Extension - Main Popup Component
 * 
 * This React component renders the main popup UI that appears when users click
 * the extension icon in their Chrome toolbar. It provides:
 * 
 * 1. **Version Information**: Shows installed version and checks for updates
 *    - Displays "Local Dev Build" for development versions (0.0.0)
 *    - Shows release version numbers for production builds
 *    - Checks GitHub for latest releases and shows update notifications
 * 
 * 2. **Site Access Status**: Determines if the extension can work on the current page
 *    - Uses chrome.tabs.query to get the active tab's URL
 *    - Checks if the domain matches host_permissions (home.atlassian.com)
 *    - Shows appropriate access status with visual indicators
 * 
 * 3. **Update Management**: Handles extension version updates
 *    - Fetches latest version info from GitHub API
 *    - Shows download button when updates are available
 *    - Opens release page in new tab when download is clicked
 * 
 * The component includes robust error handling with timeouts for Chrome API calls
 * and gracefully degrades to fallback states when APIs fail or timeout.
 */

import React, { useState, useEffect, useRef } from "react";
import { VersionChecker } from "../utils/versionChecker";

// Chrome extension types
declare const chrome: any;

interface VersionInfo {
  hasUpdate: boolean;
  latestVersion?: string;
  releaseUrl?: string;
}

const Popup: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isCheckingVersion, setIsCheckingVersion] = useState(false);
  const [currentTabUrl, setCurrentTabUrl] = useState<string>("");
  
  const currentVersion = chrome.runtime.getManifest().version;
  
  useEffect(() => {
    // Check for updates when popup opens
    checkForUpdates();
    
    // Set a timeout fallback only if chrome.tabs.query never calls back
    const timeoutId = setTimeout(() => {
      console.warn('[AtlasXray] chrome.tabs.query timeout, setting fallback');
      setCurrentTabUrl('about:blank');
    }, 2000); // 2 second timeout - only fires if no response received

    // Get current tab's URL with timeout and error handling
    const getCurrentTab = () => {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
          // Clear the timeout since we got a response
          clearTimeout(timeoutId);
          
          if (tabs && tabs[0]?.url) {
            setCurrentTabUrl(tabs[0].url);
          } else {
            // Handle case where no tabs are returned or no URL
            setCurrentTabUrl('about:blank');
          }
        });
      } catch (error) {
        // Clear the timeout since we got an error
        clearTimeout(timeoutId);
        console.warn('[AtlasXray] Failed to get current tab:', error);
        setCurrentTabUrl('about:blank');
      }
    };

    getCurrentTab();

    return () => clearTimeout(timeoutId);
  }, []);

  const checkForUpdates = async (): Promise<void> => {
    try {
      setIsCheckingVersion(true);
      const result = await VersionChecker.getLatestVersionInfo();
      setVersionInfo(result);
    } catch (error) {
      console.warn('[AtlasXray] Version check failed:', error);
    } finally {
      setIsCheckingVersion(false);
    }
  };





  const openReleasePage = (): void => {
    if (versionInfo?.releaseUrl) {
      chrome.tabs.create({ url: versionInfo.releaseUrl });
    }
  };

  return (
    <div style={{ width: 300, padding: '12px' }}>
      {/* Version Information */}
      <div style={{ 
        borderBottom: '1px solid #e0e0e0', 
        paddingBottom: '12px', 
        marginBottom: '12px' 
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          Atlas Xray
        </div>
        
        {/* Current Version */}
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          Installed: {currentVersion === '0.0.0' ? 'Local Dev Build' : `v${currentVersion}`}
        </div>
        

        
        {/* Latest Version Check */}
        {isCheckingVersion ? (
          <div style={{ fontSize: '12px', color: '#666' }}>
            Checking for updates...
          </div>
        ) : versionInfo ? (
          <div style={{ fontSize: '12px' }}>
            {(() => {
              const isLocalDev = currentVersion === '0.0.0';
              
              if (versionInfo.hasUpdate) {
                return (
                  <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                    ⚠️ New version available: {versionInfo.latestVersion}
                    <button 
                      onClick={openReleasePage}
                      style={{ 
                        marginLeft: '8px', 
                        padding: '2px 6px', 
                        fontSize: '10px',
                        background: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Download
                    </button>
                  </div>
                );
              }
              
              if (versionInfo.latestVersion) {
                return (
                  <div style={{ color: '#27ae60' }}>
                    ✅ Latest: {versionInfo.latestVersion}
                    {isLocalDev && (
                      <span style={{ color: '#f39c12', marginLeft: '8px' }}>
                        (Local Dev Build)
                      </span>
                    )}
                  </div>
                );
              }
              
              return (
                <div style={{ color: '#666' }}>
                  Checking for updates...
                </div>
              );
            })()}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: '#666' }}>
            Unable to check for updates
          </div>
        )}
      </div>

      {/* Domain Status */}
      <div style={{ marginBottom: '12px' }}>
        {/* Current Domain Info */}
        <div style={{ fontSize: '14px', color: '#888', wordBreak: 'break-all', marginBottom: '4px' }}>
          {(() => {
            if (!currentTabUrl) {
              return 'Loading...';
            }
            
            try {
              if (currentTabUrl === 'about:blank') {
                return 'Unknown page';
              }
              return new URL(currentTabUrl).hostname;
            } catch (error) {
              return 'Invalid URL';
            }
          })()}
        </div>
        
        {/* Extension Access Status */}
        <div style={{ fontSize: '12px' }}>
          {(() => {
            if (!currentTabUrl) {
              return (
                <div style={{ color: '#666' }}>
                  Checking site access...
                </div>
              );
            }
            
            if (currentTabUrl === 'about:blank') {
              return (
                <div style={{ color: '#f39c12' }}>
                  ⚠️ Unable to determine site
                </div>
              );
            }
            
            // Only grant access to domains that are explicitly in host_permissions
            const hasAccess = currentTabUrl.includes('home.atlassian.com');
            
            if (hasAccess) {
              return (
                <div style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  ✅ Has access to this site
                </div>
              );
            } else {
              return (
                <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  ❌ No access to this site
                </div>
              );
            }
          })()}
        </div>
      </div>




    </div>
  );
};

export default Popup;
