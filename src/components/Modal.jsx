import React from "react";
import ModalDialog, { ModalTransition } from "@atlaskit/modal-dialog";

export default function Modal({ open, onClose, children }) {
  return (
    <ModalTransition>
      {open && (
        <ModalDialog
          onClose={onClose}
          heading="Projects"
          width="full"
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
