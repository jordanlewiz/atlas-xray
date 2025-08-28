import React, { useState } from "react";
import ModalDialog from "@atlaskit/modal-dialog";
import {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@atlaskit/modal-dialog";
import Heading from '@atlaskit/heading';
import SectionMessage from "@atlaskit/section-message";
import Lozenge from "@atlaskit/lozenge";
import { Grid, Box, Inline,Stack } from "@atlaskit/primitives";
import { getDueDateDiff } from "../../utils/timelineUtils";
import { formatDistance } from "date-fns";
import type { ProjectUpdateModalProps } from "../../types";
import { renderProseMirror } from '../../services/ProseMirrorService';
import { ImageRenderer } from "../ImageRenderer";
import QualityIndicator from "../QualityIndicator/QualityIndicator";
import { DateDifference } from "../DateDifference/DateDifference";
// Quality analysis data is now stored directly in update objects by ProjectPipeline

/**
 * Extract media nodes from ProseMirror content
 */
function extractMediaNodes(content: any[]): any[] {
  const mediaNodes: any[] = [];
  
  function traverse(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'media' && node.attrs?.id) {
        mediaNodes.push(node);
      }
      if (node.content && Array.isArray(node.content)) {
        traverse(node.content);
      }
    }
  }
  
  if (content && Array.isArray(content)) {
    traverse(content);
  }
  
  return mediaNodes;
}

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
            <ModalTitle>{project?.name || 'Project Update Details'}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Box style={{ maxWidth: '1128px', minWidth: '900px', margin: '0 auto', width: '100%' }}>
              <Grid>
                <div className="update-modal-body">                  
                  {/* Project Key */}
                  <div className="update-modal-project-key">
                    <small>Project Key: {project?.projectKey}</small>
                  </div>

                  <div className="update-modal-section">
                    {/* Creator Information */}
                    {selectedUpdate.creatorName && (
                      <Heading size="small">{selectedUpdate.creatorName}</Heading>
                    )}
                  
                    {/* Update Time Added */}
                    {selectedUpdate.creationDate && (
                      <div className="update-modal-creation-date">
                         {formatDistance(new Date(selectedUpdate.creationDate), new Date(), { addSuffix: true })}
                      </div>
                    )}
                  </div>

                  <Inline space="space.1000">                    
                    {/* Date Change Detected */}
                    {selectedUpdate.oldTargetDate && (
                      <SectionMessage appearance="error" title="Date Change Detected">
                        <div className="date-change-display">
                          <span className="old-date">{selectedUpdate.oldTargetDate}</span>
                          <span className="arrow">→</span>
                          <span className="new-date">{selectedUpdate.newTargetDate}</span>
                        </div>
                        <div className="change-difference">
                          <strong>Difference:</strong> 
                          <DateDifference 
                            oldDate={selectedUpdate.oldTargetDate} 
                            newDate={selectedUpdate.newTargetDate} 
                            className="" 
                          />
                          days
                        </div>
                      </SectionMessage>
                    )}

                    {/* Status Change Detected */}
                    {selectedUpdate.oldState && (
                      <SectionMessage appearance="error" title="Status Change Detected">
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
                  </Inline>

                  {/* Update Summary */}
                  {selectedUpdate.summary && (
                     <div className="update-modal-section">
                       <Heading size="medium">Update Summary:</Heading>
                       <div className="update-modal-section-content">
                         <div dangerouslySetInnerHTML={{ __html: renderProseMirror(selectedUpdate.summary) }} />
                         {/* Render stored images for media nodes */}
                         {(() => {
                           try {
                             const summaryContent = JSON.parse(selectedUpdate.summary);
                             const mediaNodes = extractMediaNodes(summaryContent.content);
                             return mediaNodes.map((mediaNode: any, idx: number) => (
                               <ImageRenderer
                                 key={`summary-${idx}`}
                                 projectKey={project?.projectKey || ''}
                                 mediaId={mediaNode.attrs?.id || ''}
                                 fallbackText={`🖼️ Image (${mediaNode.attrs?.id || ''})`}
                               />
                             ));
                           } catch (e) {
                             return null;
                           }
                         })()}
                       </div>
                     </div>
                   )}

                  {/* Update Details (if provided) */}
                  {selectedUpdate.details && (
                     <div className="details-section">
                       <Heading size="medium">Update Details:</Heading>
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
