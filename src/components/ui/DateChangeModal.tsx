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
import { getDueDateDiff } from "../../utils/timelineViewModels";
import type { DateChangeModalProps } from "../../types";

/**
 * Modal displaying detailed information about a project date or status change.
 */
export default function DateChangeModal({ 
  selectedUpdate, 
  project, 
  onClose 
}: DateChangeModalProps): React.JSX.Element | null {
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

  const extractTextFromSummary = (summary: string | undefined): string => {
    if (!summary) return 'No summary available';
    
    let parsedSummary: any = summary;
    if (typeof summary === 'string') {
      if (summary.startsWith('{') && summary.endsWith('}')) {
        try {
          parsedSummary = JSON.parse(summary);
        } catch (error) {
          return summary;
        }
      } else {
        return summary;
      }
    }
    
    if (parsedSummary && typeof parsedSummary === 'object' && parsedSummary.content) {
      try {
        const extractText = (node: any): string => {
          if (node.type === 'text' && node.text) {
            return node.text;
          }
          if (node.type === 'emoji' && node.attrs && node.attrs.text) {
            return node.attrs.text;
          }
          if (node.content && Array.isArray(node.content)) {
            return node.content.map(extractText).filter(Boolean).join('');
          }
          return '';
        };
        const result = extractText(parsedSummary).trim();
        return result || 'No summary available';
      } catch (error) {
        console.warn('Error parsing summary:', error);
        return 'Summary parsing error';
      }
    }
    return 'No summary available';
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
            <Box
              style={{ maxWidth: '1128px', margin: '0 auto', width: '100%' }}
            >
              <Grid>
                <div style={{ padding: '16px' }}>
                <h3>{project?.name}</h3>
                <div style={{ margin: '16px 0' }}>
                  <small>Project Key:</small> {project?.projectKey}
                </div>

                {selectedUpdate.oldDueDate && (
                  <SectionMessage
                    appearance="error"
                    title="Date Change Detected"
                  >
                    <div style={{ margin: '8px 0' }}>
                      <strong>Date Change:</strong>
                    </div>
                    <div style={{ fontSize: '16px', margin: '8px 0' }}>
                      <span style={{ color: 'red' }}>{selectedUpdate.oldDueDate}</span>
                      <span style={{ margin: '0 16px' }}>→</span>
                      <span style={{ color: 'green' }}>{selectedUpdate.newDueDate}</span>
                    </div>
                    <div style={{ margin: '8px 0' }}>
                      <strong>Difference:</strong> {getDueDateDiff(selectedUpdate)} days
                    </div>
                  </SectionMessage>
                )}

                {selectedUpdate.oldState && (
                  <SectionMessage
                    appearance="error"
                    title="Status Change Detected"
                  >
                    <div style={{ margin: '8px 0' }}>
                      <strong>Status Change:</strong>
                    </div>
                    <div style={{ fontSize: '16px', margin: '8px 0' }}>
                      <Lozenge appearance={getLozengeAppearance(selectedUpdate.oldState)}>
                        {selectedUpdate.oldState}
                      </Lozenge>
                      <span style={{ margin: '0 16px' }}>→</span>
                      <Lozenge appearance={getLozengeAppearance(selectedUpdate.state)}>
                        {selectedUpdate.state}
                      </Lozenge>
                    </div>
                  </SectionMessage>
                )}

                {selectedUpdate.summary && (
                  <div style={{ margin: '8px 0' }}>
                    <h3>Update Summary:</h3>
                    <p style={{ margin: '8px 0', lineHeight: '1.5' }}>
                      {extractTextFromSummary(selectedUpdate.summary)}
                    </p>
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
