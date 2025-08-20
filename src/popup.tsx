import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { VersionChecker } from "./utils/versionChecker";

// Chrome extension types
declare const chrome: any;

interface VersionInfo {
  hasUpdate: boolean;
  latestVersion?: string;
  releaseUrl?: string;
}

const Popup: React.FC = () => {
  console.log("PopupApp");
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isCheckingVersion, setIsCheckingVersion] = useState(false);
  const [currentTabUrl, setCurrentTabUrl] = useState<string>("");
  
  const currentVersion = chrome.runtime.getManifest().version;
  
  useEffect(() => {
    // Check for updates when popup opens
    checkForUpdates();
    
    // Get current tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (tabs[0]?.url) {
        setCurrentTabUrl(tabs[0].url);
      }
    });
  }, []);

  const checkForUpdates = async (): Promise<void> => {
    try {
      setIsCheckingVersion(true);
      const response = await fetch('https://api.github.com/repos/jordanlewiz/atlas-xray/releases/latest');
      if (response.ok) {
        const release = await response.json();
        const latestVersion = release.tag_name.replace(/^v/, '');
        
        // Compare versions using VersionChecker
        const hasUpdate = VersionChecker.isNewerVersion(latestVersion, currentVersion);
        
        setVersionInfo({
          hasUpdate,
          latestVersion: release.tag_name,
          releaseUrl: release.html_url
        });
      }
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
          {currentTabUrl ? new URL(currentTabUrl).hostname : 'Loading...'}
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
            
            const hasAccess = currentTabUrl.includes('atlassian.com') || currentTabUrl.includes('jira.com') || currentTabUrl.includes('confluence.com');
            
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

// Bootstrap the React app
const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
