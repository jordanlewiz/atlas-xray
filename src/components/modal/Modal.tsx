import React, { useState } from "react";
import {
  FullScreenModalDialog,
  ModalBody,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog/full-screen";
import Select from "@atlaskit/select";
import StatusLegend from "../ui/StatusLegend";
import { Grid, Box } from "@atlaskit/primitives";
import type { ModalProps } from "../../types";

/**
 * Main modal dialog for the timeline.
 */
export default function Modal({ open, onClose, children }: ModalProps): React.JSX.Element | null {
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
        <ModalHeader hasCloseButton>
          <ModalTitle>Atlas-Xray Project History Timeline</ModalTitle>
        </ModalHeader>
        <ModalBody hasInlinePadding={true}>
          <Box
            style={{ maxWidth: '1128px', margin: '0 auto', width: '100%' }}
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
      </FullScreenModalDialog>
    </ModalTransition>
  );
}
