import React from "react";
import ModalDialog from "@atlaskit/modal-dialog";
import {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@atlaskit/modal-dialog";
import SectionMessage from "@atlaskit/section-message";
import Lozenge from "@atlaskit/lozenge";
import { Grid, Box } from "@atlaskit/primitives";
import { getDueDateDiff } from "../../utils/timelineUtils";
import type { ProjectUpdateModalProps } from "../../types";
import { renderProseMirror } from "../../utils/proseMirrorRenderer";

/**
 * Modal displaying detailed information about a project update.
 */
export default function ProjectUpdateModal({ 
  selectedUpdate, 
  project, 
  onClose 
}: ProjectUpdateModalProps): React.JSX.Element | null {
  const getLozengeAppearance = (status: string | undefined): any => {
    if (!status) return 'new';
    const normalizedStatus = status.toLowerCase().replace(/_/g, '-');
    switch (normalizedStatus) {
      case 'on-track': return 'success';
      case 'off-track': return 'removed-bold';
      case 'none': return 'new';
      case 'at-risk': return 'moved';
      case 'pending': return 'inprogress';
      case 'paused': return 'default';
      case 'cancelled': return 'default-bold';
      case 'done': return 'success-bold';
      default: return 'default';
    }
  };

  if (!selectedUpdate) return null;

  return (
    <ModalTransition>
      {selectedUpdate && (
        <ModalDialog
          onClose={onClose}
          width="full"
          shouldScrollInViewport
        >
          <ModalHeader>
            <ModalTitle>Date Change Details</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Box style={{ maxWidth: '1128px', margin: '0 auto', width: '100%' }}>
              <Grid>
                <div className="date-change-modal-body">
                  <h3 className="project-name">{project?.name}</h3>
                  <div className="project-key">
                    <small>Project Key:</small> {project?.projectKey}
                  </div>

                                    {selectedUpdate.oldDueDate && (
                    <SectionMessage
                      appearance="error"
                      title="Date Change Detected"
                    >
                      <div className="change-section">
                        <strong>Date Change:</strong>
                      </div>
                      <div className="date-change-display">
                        <span className="old-date">{selectedUpdate.oldDueDate}</span>
                        <span className="arrow">→</span>
                        <span className="new-date">{selectedUpdate.newDueDate}</span>
                      </div>
                      <div className="change-difference">
                        <strong>Difference:</strong> {getDueDateDiff(selectedUpdate)} days
                      </div>
                    </SectionMessage>
                  )}

                  {selectedUpdate.oldState && (
                    <SectionMessage
                      appearance="error"
                      title="Status Change Detected"
                    >
                      <div className="change-section">
                        <strong>Status Change:</strong>
                      </div>
                      <div className="status-change-display">
                        <Lozenge appearance={getLozengeAppearance(selectedUpdate.oldState)}>
                          {selectedUpdate.oldState}
                        </Lozenge>
                        <span className="arrow">→</span>
                        <Lozenge appearance={getLozengeAppearance(selectedUpdate.state)}>
                          {selectedUpdate.state}
                        </Lozenge>
                      </div>
                    </SectionMessage>
                  )}

                  {selectedUpdate.summary && (
                     <div className="summary-section">
                       <h3>Update Summary:</h3>
                       <div className="summary-content">
                         <div dangerouslySetInnerHTML={{ __html: renderProseMirror(selectedUpdate.summary) }} />
                       </div>
                     </div>
                   )}

                   {selectedUpdate.details && (
                     <div className="details-section">
                       <h3>Update Details:</h3>
                       <div className="details-content">
                         {(() => {
                           try {
                             const parsedDetails = JSON.parse(selectedUpdate.details);
                             if (Array.isArray(parsedDetails) && parsedDetails.length > 0) {
                               return parsedDetails.map((note: any, idx: number) => (
                                 <div key={idx} className="note-item">
                                   <strong>{note.title || 'Note'}:</strong>
                                   <div dangerouslySetInnerHTML={{ __html: renderProseMirror(note.summary) }} />
                                 </div>
                               ));
                             }
                           } catch (e) {
                             console.error('Error parsing details:', e);
                           }
                           return <div className="no-details">No detailed update provided</div>;
                         })()}
                       </div>
                     </div>
                   )}
                </div>
              </Grid>
            </Box>
          </ModalBody>
        </ModalDialog>
      )}
    </ModalTransition>
  );
}
