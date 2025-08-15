import React, { useEffect, useState } from "react";
import { setItem, getItem } from "./utils/dexieDB";

const STORAGE_KEY = "demoValue";

const Popup = () => {
  const [value, setValue] = useState("");
  const [stored, setStored] = useState("");

  useEffect(() => {
    getItem(STORAGE_KEY).then((val) => {
      if (val) setStored(val);
    });
  }, []);

  const handleSave = async () => {
    await setItem(STORAGE_KEY, value);
    setStored(value);
    setValue("");
  };

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
      <button onClick={handleSave} style={{ marginTop: 8, width: "100%" }}>
        Save to IndexedDB
      </button>
    </div>
  );
};

export default Popup;
