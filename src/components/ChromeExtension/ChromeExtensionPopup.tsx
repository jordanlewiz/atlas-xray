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
import { VersionChecker } from "../../utils/versionChecker";
import "./ChromeExtensionPopup.scss";

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
    <div className="chrome-extension-popup">
      {/* Version Information */}
      <div className="chrome-extension-popup__version-section">
        <div className="chrome-extension-popup__title">
          Atlas Xray
        </div>
        
        {/* Current Version */}
        <div className="chrome-extension-popup__version-info">
          Installed: {currentVersion === '0.0.0' ? 'Local Dev Build' : `v${currentVersion}`}
        </div>
        

        
        {/* Latest Version Check */}
        {isCheckingVersion ? (
          <div className="chrome-extension-popup__checking-updates">
            Checking for updates...
          </div>
        ) : versionInfo ? (
          <div className="chrome-extension-popup__update-status">
            {(() => {
              const isLocalDev = currentVersion === '0.0.0';
              
              if (versionInfo.hasUpdate) {
                return (
                  <div className="chrome-extension-popup__update-available">
                    ⚠️ New version available: {versionInfo.latestVersion}
                    <button 
                      onClick={openReleasePage}
                      className="chrome-extension-popup__download-button"
                    >
                      Download
                    </button>
                  </div>
                );
              }
              
              if (versionInfo.latestVersion) {
                return (
                  <div className="chrome-extension-popup__latest-version">
                    ✅ Latest: {versionInfo.latestVersion}
                    {isLocalDev && (
                      <span className="chrome-extension-popup__local-dev-note">
                        (Local Dev Build)
                      </span>
                    )}
                  </div>
                );
              }
              
              return (
                <div className="chrome-extension-popup__checking-updates">
                  Checking for updates...
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="chrome-extension-popup__update-error">
            Unable to check for updates
          </div>
        )}
      </div>

      {/* Domain Status */}
      <div className="chrome-extension-popup__site-access-section">
        {/* Current Domain Info */}
        <div className="chrome-extension-popup__page-title">
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
        <div className="chrome-extension-popup__access-status">
          {(() => {
            if (!currentTabUrl) {
              return (
                <div className="chrome-extension-popup__checking-updates">
                  Checking site access...
                </div>
              );
            }
            
            if (currentTabUrl === 'about:blank') {
              return (
                <div className="chrome-extension-popup__unknown-page">
                  ⚠️ Unable to determine site
                </div>
              );
            }
            
            // Only grant access to domains that are explicitly in host_permissions
            const hasAccess = currentTabUrl.includes('home.atlassian.com');
            
            if (hasAccess) {
              return (
                <div className="chrome-extension-popup__access-granted">
                  ✅ Has access to this site
                </div>
              );
            } else {
              return (
                <div className="chrome-extension-popup__access-denied">
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
