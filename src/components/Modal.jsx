import React, { useState } from "react";
import ModalDialog, { ModalTransition } from "@atlaskit/modal-dialog";
import Select from "@atlaskit/select";

export default function Modal({ open, onClose, children }) {
  const [weekLimit, setWeekLimit] = useState(12); // default to 12 weeks
  const weekOptions = [
    { label: "4 weeks", value: 4 },
    { label: "8 weeks", value: 8 },
    { label: "12 weeks", value: 12 },
    { label: "24 weeks", value: 24 },
    { label: "All", value: Infinity }
  ];
  return (
    <ModalTransition>
      {open && (
        <ModalDialog
          onClose={onClose}
          heading="Atlas-Xray Project History Timeline"
          width="x-large"
          shouldScrollInViewport
          actions={[
            { text: 'Close', onClick: onClose, appearance: 'subtle' }
          ]}
        >
          <div style={{ marginBottom: 16, maxWidth: 200 }}>
            <Select
              options={weekOptions}
              value={weekOptions.find(opt => opt.value === weekLimit)}
              onChange={option => setWeekLimit(option.value)}
              placeholder="Weeks to show"
              isSearchable={false}
            />
          </div>
          {/* Pass weekLimit as a prop to children if children is a function */}
          {typeof children === 'function' ? children(weekLimit) : children}
        </ModalDialog>
      )}
    </ModalTransition>
  );
}
