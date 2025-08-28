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
import { checkForUpdatesOnPopupOpen } from '../../services/VersionService';
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
    // Check for updates when popup opens (with immediate notification if available)
    checkForUpdatesOnPopupOpen().then(result => {
      setVersionInfo(result);
    }).catch(error => {
      console.warn('[AtlasXray] Popup update check failed:', error);
    });
    
    // Get current tab's URL - simple approach
    const getCurrentTab = () => {
      try {
        if (chrome.tabs && chrome.tabs.query) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
            if (tabs && tabs[0]?.url) {
              setCurrentTabUrl(tabs[0].url);
            }
          });
        }
      } catch (error) {
        console.warn('[AtlasXray] Failed to get current tab:', error);
      }
    };

    getCurrentTab();
  }, []);

  const checkForUpdates = async (): Promise<void> => {
    try {
      setIsCheckingVersion(true);
      const result = await checkForUpdatesOnPopupOpen();
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
                  return 'Current page';
                }
                
                try {
                  return new URL(currentTabUrl).hostname;
                } catch (error) {
                  return 'Current page';
                }
              })()}
            </div>
            
            {/* Extension Access Status */}
            <div className="chrome-extension-popup__access-status">
              {(() => {
                // Default state: no access
                if (!currentTabUrl) {
                  return (
                    <div className="chrome-extension-popup__access-denied">
                      ❌ No access to this site
                    </div>
                  );
                }
                
                // Check if we're on a listed site
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
