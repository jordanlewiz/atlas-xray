import React, { useEffect, useState } from "react";

const STORAGE_KEY = "demoValue";

const Popup = () => {
  const [value, setValue] = useState("");
  const [stored, setStored] = useState("");

  // Remove useEffect and handleSave logic related to indexeddb

  return (
    <div style={{ width: 250 }}>
      <div>Stored value: <b>{stored || "(none)"}</b></div>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Type something..."
        style={{ width: "100%", marginTop: 8 }}
      />
      <button style={{ marginTop: 8, width: "100%" }}>
        Save to IndexedDB
      </button>
    </div>
  );
};

export default Popup;
