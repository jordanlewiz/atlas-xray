import React, { useState } from "react";
import {
  FullScreenModalDialog,
  ModalBody,
  ModalTransition,
} from "@atlaskit/modal-dialog/full-screen";
import { useModal } from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button/new";
import CrossIcon from "@atlaskit/icon/glyph/cross";
import { Box } from "@atlaskit/primitives";
import type { ProjectStatusHistoryModalProps } from "../../types";

/**
 * Custom dark header component for the modal.
 */
function CustomModalHeader(): React.JSX.Element {
  const { onClose, titleId } = useModal();

  return (
    <div className="custom-modal-header">
      <h2 id={titleId} className="custom-modal-title">
        Atlas-Xray Project History Timeline
      </h2>
      <Button
        appearance="subtle"
        onClick={onClose}
        iconBefore={CrossIcon}
      >
        Close
      </Button>
    </div>
  );
}

/**
 * Main modal dialog for the project status history timeline.
 */
export default function ProjectStatusHistoryModal({ open, onClose, children }: ProjectStatusHistoryModalProps): React.JSX.Element | null {
  if (!open) return null;

  return (
    <ModalTransition>
      <FullScreenModalDialog onClose={onClose}>
        <div className="project-status-history-modal">
          <CustomModalHeader />
          <ModalBody hasInlinePadding={true}>
            <Box
              style={{ 
                maxWidth: '1128px', 
                margin: '0 auto', 
                width: '100%',
                minHeight: 'calc(100vh - 200px)', // Ensure minimum height for scrolling
                overflow: 'auto' // Enable scrolling
              }}
            >
              {typeof children === 'function' ? children(12) : children}
            </Box>
          </ModalBody>
        </div>
      </FullScreenModalDialog>
    </ModalTransition>
  );
}
