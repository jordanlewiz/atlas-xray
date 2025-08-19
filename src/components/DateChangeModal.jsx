import React from "react";
import ModalDialog, { ModalTransition } from "@atlaskit/modal-dialog";
import SectionMessage from "@atlaskit/section-message";
import Lozenge from "@atlaskit/lozenge";
import { getDueDateDiff } from "../utils/timelineViewModels";

export default function DateChangeModal({ selectedUpdate, project, onClose }) {
  // Helper function to get Lozenge appearance based on status
  const getLozengeAppearance = (status, isBold = false) => {
    if (!status) return 'new';
    
    const normalizedStatus = status.toLowerCase().replace(/_/g, '-');
    
    switch (normalizedStatus) {
      case 'on-track':
        return isBold ? 'success-bold' : 'success';
      case 'off-track':
        return 'removed-bold';
      case 'none':
        return 'new';
      case 'at-risk':
        return 'moved';
      case 'pending':
        return 'inprogress';
      case 'paused':
        return 'default';
      case 'cancelled':
        return 'default-bold';
      case 'done':
        return 'success-bold';
      default:
        return 'default';
    }
  };

  // Helper function to extract text from ProseMirror document
  const extractTextFromSummary = (summary) => {
    let parsedSummary = summary;
    
    // If it's a string that looks like JSON, try to parse it
    if (typeof summary === 'string') {
      if (summary.startsWith('{') && summary.endsWith('}')) {
        try {
          parsedSummary = JSON.parse(summary);
        } catch (error) {
          // If parsing fails, treat it as a regular string
          return summary;
        }
      } else {
        // It's a regular string, return as-is
        return summary;
      }
    }
    
    // Now handle the parsed object
    if (parsedSummary && typeof parsedSummary === 'object' && parsedSummary.content) {
      try {
        // Recursively extract text from the document structure
        const extractText = (node) => {
          // Handle text nodes
          if (node.type === 'text' && node.text) {
            return node.text;
          }
          
          // Handle emoji nodes
          if (node.type === 'emoji' && node.attrs && node.attrs.text) {
            return node.attrs.text;
          }
          
          // Handle nodes with content (like paragraphs, documents, etc.)
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

  return (
    <ModalTransition>
      {selectedUpdate && (
        <ModalDialog
          onClose={onClose}
          heading="Date Change Details"
          width="medium"
          shouldScrollInViewport
          actions={[
            { text: 'Close', onClick: onClose, appearance: 'subtle' }
          ]}
        >
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
                    <Lozenge appearance={getLozengeAppearance(selectedUpdate.oldState)}>{selectedUpdate.oldState}</Lozenge>
                    <span style={{ margin: '0 16px' }}>→</span> 
                    <Lozenge appearance={getLozengeAppearance(selectedUpdate.state)}>{selectedUpdate.state}</Lozenge>
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
        </ModalDialog>
      )}
    </ModalTransition>
  );
}
