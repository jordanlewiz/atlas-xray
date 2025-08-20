import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { getItem } from "./utils/database";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./utils/database";

const STORAGE_KEY = "demoValue";

interface VersionInfo {
  hasUpdate: boolean;
  latestVersion?: string;
  releaseUrl?: string;
}

const Popup: React.FC = () => {
  console.log("PopupApp");
  const [stored, setStored] = useState<string>("");
  const [resetMsg, setResetMsg] = useState<string>("");
  const [refreshMsg, setRefreshMsg] = useState<string>("");
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isCheckingVersion, setIsCheckingVersion] = useState(false);
  
  const projectCount = useLiveQuery(() => db.projectView.count(), []);
  const currentVersion = chrome.runtime.getManifest().version;

  console.log("projectCount", projectCount);
  
  useEffect(() => {
    getItem(STORAGE_KEY).then((val) => {
      if (val) setStored(val);
    });
    
    // Check for updates when popup opens
    checkForUpdates();
  }, []);

  const checkForUpdates = async (): Promise<void> => {
    try {
      setIsCheckingVersion(true);
      const response = await fetch('https://api.github.com/repos/jordanlewiz/atlas-xray/releases/latest');
      if (response.ok) {
        const release = await response.json();
        const latestVersion = release.tag_name.replace(/^v/, '');
        
        // Compare versions
        const hasUpdate = isNewerVersion(latestVersion, currentVersion);
        
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

  const isNewerVersion = (latest: string, current: string): boolean => {
    const l = latest.split('.').map(Number);
    const c = current.split('.').map(Number);
    
    for (let i = 0; i < Math.max(l.length, c.length); i++) {
      const lNum = (l[i] || 0);
      const cNum = (c[i] || 0);
      
      if (lNum > cNum) return true;
      if (lNum < cNum) return false;
    }
    
    return false;
  };

  const handleResetDB = async (): Promise<void> => {
    /*if (window.confirm("Are you sure you want to clear all AtlasXrayDB data?")) {
      await Promise.all(db.tables.map(table => table.clear()));
      setResetMsg("All data cleared from AtlasXrayDB!");
    }*/
  };

  const handleRefreshUpdates = async (): Promise<void> => {
    setRefreshMsg(`Project count refreshed! >> ${projectCount} <<`);
    setTimeout(() => setRefreshMsg(""), 1500);
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
          Installed: v{currentVersion}
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
              
              if (isLocalDev) {
                return (
                  <div style={{ color: '#f39c12', fontWeight: 'bold' }}>
                    🔧 Local Dev Build - Updates not checked
                  </div>
                );
              }
              
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
              
              return (
                <div style={{ color: '#27ae60' }}>
                  ✅ Up to date ({versionInfo.latestVersion})
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

      {/* Project Information */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          Projects in DB: <b>{projectCount === undefined ? "Loading..." : projectCount}</b>
        </div>
      </div>

      {/* Action Buttons */}
      <button 
        onClick={handleResetDB} 
        style={{ 
          marginBottom: '8px', 
          width: "100%", 
          background: '#e74c3c', 
          color: '#fff',
          border: 'none',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Clear All AtlasXrayDB Data
      </button>
      
      <button 
        onClick={handleRefreshUpdates} 
        style={{ 
          marginBottom: '8px', 
          width: "100%", 
          background: '#2980b9', 
          color: '#fff',
          border: 'none',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Refresh Project Count
      </button>

      {/* Messages */}
      {resetMsg && <div style={{ color: '#27ae60', marginTop: '8px', fontSize: '12px' }}>{resetMsg}</div>}
      {refreshMsg && <div style={{ color: '#2980b9', marginTop: '8px', fontSize: '12px' }}>{refreshMsg}</div>}
    </div>
  );
};

// Bootstrap the React app
const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
