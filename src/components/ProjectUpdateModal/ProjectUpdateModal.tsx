import React, { useState } from "react";
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
import { ImageRenderer } from "../ImageRenderer";
import QualityIndicator from "../QualityIndicator/QualityIndicator";
import { useUpdateQuality } from "../../hooks/useUpdateQuality";

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
  const { getUpdateQuality, analyzeUpdate } = useUpdateQuality();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTrigger, setAnalysisTrigger] = useState(0);
  
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
            <Box style={{ maxWidth: '1128px', margin: '0 auto', width: '100%' }}>
              <Grid>
                <div className="date-change-modal-body">
                  <div className="project-key">
                    <small>Project Key:</small> {project?.projectKey}
                  </div>

                  {/* Quality Analysis Section */}
                  {selectedUpdate.id && (() => {
                    // Use analysisTrigger to force re-evaluation of quality data
                    const quality = getUpdateQuality(selectedUpdate.id);
                    if (quality) {
                      return (
                        <SectionMessage
                          appearance="info"
                          title="AI Quality Analysis"
                        >
                          <div className="quality-analysis-section">
                            <div className="quality-header">
                              <QualityIndicator
                                score={quality.overallScore}
                                level={quality.qualityLevel}
                                size="large"
                                showScore={true}
                                className="quality-indicator-modal"
                              />
                              <span className="quality-summary">{quality.summary}</span>
                            </div>
                            
                            {quality.analysis.length > 0 && (
                              <div className="quality-details">
                                <h4>Quality Criteria Analysis:</h4>
                                {quality.analysis.map((criteria, idx) => (
                                  <div key={idx} className="criteria-item">
                                    <div className="criteria-header">
                                      <span className="criteria-title">{criteria.title}</span>
                                      <span className="criteria-score">
                                        {criteria.score}/{criteria.maxScore}
                                      </span>
                                    </div>
                                    {criteria.missingInfo.length > 0 && (
                                      <div className="missing-info">
                                        <strong>Missing Information:</strong>
                                        <ul>
                                          {criteria.missingInfo.map((info, infoIdx) => (
                                            <li key={infoIdx}>{info}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {criteria.recommendations.length > 0 && (
                                      <div className="recommendations">
                                        <strong>Recommendations:</strong>
                                        <ul>
                                          {criteria.recommendations.map((rec, recIdx) => (
                                            <li key={recIdx}>{rec}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {quality.missingInfo.length > 0 && (
                              <div className="overall-missing">
                                <strong>Overall Missing Information:</strong>
                                <ul>
                                  {quality.missingInfo.map((info, idx) => (
                                    <li key={idx}>{info}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </SectionMessage>
                      );
                    } else {
                      // Show analysis trigger button for updates without quality data
                      return (
                        <SectionMessage
                          appearance="warning"
                          title="Quality Analysis Not Available"
                        >
                          <div className="quality-analysis-trigger">
                            <p>This update hasn't been analyzed for quality yet.</p>
                            <button 
                              className="analyze-quality-btn"
                              disabled={isAnalyzing}
                              onClick={async () => {
                                try {
                                  setIsAnalyzing(true);
                                  await analyzeUpdate(selectedUpdate);
                                  // Trigger a re-render by updating state
                                  setAnalysisTrigger(prev => prev + 1);
                                } catch (error) {
                                  console.error('Failed to analyze update:', error);
                                  alert('Failed to analyze update quality. Please try again.');
                                } finally {
                                  setIsAnalyzing(false);
                                }
                              }}
                            >
                              {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Update Quality'}
                            </button>
                          </div>
                        </SectionMessage>
                      );
                    }
                  })()}

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
