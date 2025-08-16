import React, { useState } from "react";
import { getItem } from "./utils/database";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./utils/database";

const STORAGE_KEY = "demoValue";

const Popup = () => {
  console.log("PopupApp");
  const [stored, setStored] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const projectCount = useLiveQuery(() => db.projectView.count(), []);
  const [refreshMsg, setRefreshMsg] = useState("");

  console.log("projectCount", projectCount);
  React.useEffect(() => {
    getItem(STORAGE_KEY).then((val) => {
      if (val) setStored(val);
    });
  }, []);

  const handleResetDB = async () => {
    /*if (window.confirm("Are you sure you want to clear all AtlasXrayDB data?")) {
      await Promise.all(db.tables.map(table => table.clear()));
      setResetMsg("All data cleared from AtlasXrayDB!");
    }*/
  };

  const handleRefreshUpdates = async () => {
    setRefreshMsg(`Project count refreshed! >> ${projectCount} <<`);
    setTimeout(() => setRefreshMsg(""), 1500);
  };

  return (
    <div style={{ width: 250 }}>
      <div style={{ marginTop: 8 }}>Projects in DB: <b>{projectCount === undefined ? "Loading..." : projectCount}</b></div>
      <button onClick={handleResetDB} style={{ marginTop: 8, width: "100%", background: '#e74c3c', color: '#fff' }}>
        Clear All AtlasXrayDB Data
      </button>
      <button onClick={handleRefreshUpdates} style={{ marginTop: 8, width: "100%", background: '#2980b9', color: '#fff' }}>
        Refresh Project Count
      </button>
      {resetMsg && <div style={{ color: '#27ae60', marginTop: 8 }}>{resetMsg}</div>}
      {refreshMsg && <div style={{ color: '#2980b9', marginTop: 8 }}>{refreshMsg}</div>}
    </div>
  );
};

export default Popup;
