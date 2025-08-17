import React from "react";
import ModalDialog, { ModalTransition } from "@atlaskit/modal-dialog";

export default function Modal({ open, onClose, children }) {
  return (
    <ModalTransition>
      {open && (
        <ModalDialog
          onClose={onClose}
          heading="Atlas-Xray Project History Timeine"
          width="x-large"
          shouldScrollInViewport
          actions={[
            { text: 'Close', onClick: onClose, appearance: 'subtle' }
          ]}
        >
          {children}
        </ModalDialog>
      )}
    </ModalTransition>
  );
}
