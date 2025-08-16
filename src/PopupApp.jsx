import React, { useEffect, useState } from "react";
import { getItem } from "./utils/database";
import Dexie from "dexie";

const STORAGE_KEY = "demoValue";

const Popup = () => {
  console.log("PopupApp");
  const [stored, setStored] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [projectCount, setProjectCount] = useState(0);
  const [refreshMsg, setRefreshMsg] = useState("");

  const loadProjectCount = async () => {
    console.log("loading project count");
    const db = new Dexie("AtlasXrayDB");
    await db.open();
    const count = await db.table("projectView").count();
    console.log("projectView count", count);
    setProjectCount(count);
  };

  useEffect(() => {
    getItem(STORAGE_KEY).then((val) => {
      if (val) setStored(val);
    });
    loadProjectCount();
  }, []);

  const handleResetDB = async () => {
    if (window.confirm("Are you sure you want to clear all AtlasXrayDB data?")) {
      const db = new Dexie("AtlasXrayDB");
      await db.open();
      await Promise.all(db.tables.map(table => table.clear()));
      setResetMsg("All data cleared from AtlasXrayDB!");
      setProjectCount(0);
    }
  };

  const handleRefreshUpdates = async () => {
    console.log("refreshing project count");
    setRefreshMsg("Refreshing...");
    await loadProjectCount();
    setRefreshMsg("Project count refreshed!");
    setTimeout(() => setRefreshMsg(""), 1500);
  };

  return (
    <div style={{ width: 250 }}>
      <div style={{ marginTop: 8 }}>Projects in DB: <b>{projectCount}</b></div>
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
