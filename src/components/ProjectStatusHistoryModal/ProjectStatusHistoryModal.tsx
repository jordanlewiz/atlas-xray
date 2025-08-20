import React, { useState } from "react";
import {
  FullScreenModalDialog,
  ModalBody,
  ModalTransition,
} from "@atlaskit/modal-dialog/full-screen";
import { useModal } from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button/new";
import CrossIcon from "@atlaskit/icon/glyph/cross";
import Select from "@atlaskit/select";
import StatusLegend from "../StatusLegend";
import { Grid, Box } from "@atlaskit/primitives";
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
  const [weekLimit, setWeekLimit] = useState(12); // default to 12 weeks
  const weekOptions = [
    { label: "4 weeks", value: 4 },
    { label: "8 weeks", value: 8 },
    { label: "12 weeks", value: 12 },
    { label: "24 weeks", value: 24 },
    { label: "All", value: Infinity }
  ];

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
              <Grid>
                <StatusLegend />
                <div style={{ marginBottom: 16, maxWidth: 200 }}>
                  <Select
                    options={weekOptions}
                    value={weekOptions.find(opt => opt.value === weekLimit)}
                    onChange={(option: any) => setWeekLimit(option.value)}
                    placeholder="Weeks to show"
                    isSearchable={false}
                  />
                </div>
                {typeof children === 'function' ? children(weekLimit) : children}
              </Grid>
            </Box>
          </ModalBody>
        </div>
      </FullScreenModalDialog>
    </ModalTransition>
  );
}
