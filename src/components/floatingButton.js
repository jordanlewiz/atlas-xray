// src/components/floatingButton.js

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../utils/database";

const FloatingButton = () => {
  const projectCount = useLiveQuery(() => db.projectView.count(), []);
  return (
    <button className="atlas-xray-floating-btn">
      Atlas Xray{projectCount !== undefined ? ` (${projectCount})` : ""}
    </button>
  );
};

export default FloatingButton;
