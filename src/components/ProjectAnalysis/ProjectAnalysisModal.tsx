import React, { useState, useEffect } from 'react';
import { 
  ModalDialog, 
  ModalHeader, 
  ModalTitle, 
  ModalBody, 
  ModalFooter,
  Button,
  Badge,
  Spinner,
  Text,
  Box,
  Grid,
  Stack
} from '@atlaskit/primitives';
import { 
  CheckCircleIcon, 
  AlertIcon, 
  InfoIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@atlaskit/icon';
import { 
  ProjectUpdateAnalysis, 
  AnalysisResult, 
  groupAnalysisResults,
  QuestionId 
} from '../../utils/projectAnalyzer';
import './ProjectAnalysisModal.scss';

interface ProjectAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  updateId: string;
  originalText: string;
  analysis?: ProjectUpdateAnalysis;
  onAnalyze?: (text: string) => Promise<void>;
}

interface AnalysisSectionProps {
  title: string;
  results: AnalysisResult[];
  icon: React.ReactNode;
  className?: string;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ title, results, icon, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (results.length === 0) return null;

  return (
    <Box className={`analysis-section ${className || ''}`}>
      <Box 
        className="analysis-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        {icon}
        <Text weight="semibold">{title} ({results.length})</Text>
        {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </Box>
      
      {isExpanded && (
        <Box className="analysis-section-content">
          {results.map((result, index) => (
            <Box key={index} className="analysis-result">
              <Text size="small" weight="medium" className="question">
                {result.question}
              </Text>
              <Text size="small" className="answer">
                {result.answer}
              </Text>
              <Badge appearance="subtle" className="confidence">
                {Math.round(result.confidence * 100)}% confidence
              </Badge>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

const ProjectAnalysisModal: React.FC<ProjectAnalysisModalProps> = ({
  isOpen,
  onClose,
  projectId,
  updateId,
  originalText,
  analysis,
  onAnalyze
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ProjectUpdateAnalysis | undefined>(analysis);

  useEffect(() => {
    setCurrentAnalysis(analysis);
  }, [analysis]);

  const handleAnalyze = async () => {
    if (!onAnalyze) return;
    
    setIsAnalyzing(true);
    try {
      await onAnalyze(originalText);
      // The analysis will be updated via props
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderSentimentBadge = (sentiment: { score: number; label: string }) => {
    let appearance: 'success' | 'warning' | 'removed' = 'success';
    let icon = <CheckCircleIcon />;
    
    if (sentiment.score < 0.4) {
      appearance = 'removed';
      icon = <AlertIcon />;
    } else if (sentiment.score < 0.7) {
      appearance = 'warning';
      icon = <InfoIcon />;
    }

    return (
      <Badge appearance={appearance} className="sentiment-badge">
        {icon}
        {sentiment.label} ({Math.round(sentiment.score * 100)}%)
      </Badge>
    );
  };

  const renderAnalysisResults = () => {
    if (!currentAnalysis) return null;

    const { clearlyStated, missing } = groupAnalysisResults(currentAnalysis.analysis);

    return (
      <Stack space="space.200">
        <AnalysisSection
          title="Clearly Stated"
          results={clearlyStated}
          icon={<CheckCircleIcon />}
          className="clearly-stated"
        />
        
        <AnalysisSection
          title="Missing or Unclear"
          results={missing}
          icon={<AlertIcon />}
          className="missing"
        />
      </Stack>
    );
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      className="project-analysis-modal"
    >
      <ModalHeader>
        <ModalTitle>
          Project Update Analysis
        </ModalTitle>
      </ModalHeader>

      <ModalBody>
        <Stack space="space.300">
          {/* Project Info */}
          <Box className="project-info">
            <Text weight="semibold">Project: {projectId}</Text>
            <Text size="small" color="subtlest">Update ID: {updateId}</Text>
          </Box>

          {/* Original Text */}
          <Box className="original-text">
            <Text weight="semibold" size="small">Original Update Text:</Text>
            <Box className="text-content">
              <Text size="small">{originalText}</Text>
            </Box>
          </Box>

          {/* Analysis Results */}
          {currentAnalysis ? (
            <Stack space="space.300">
              {/* Sentiment */}
              <Box className="sentiment-section">
                <Text weight="semibold" size="small">Sentiment Analysis:</Text>
                {renderSentimentBadge(currentAnalysis.sentiment)}
              </Box>

              {/* Summary */}
              <Box className="summary-section">
                <Text weight="semibold" size="small">AI Summary:</Text>
                <Text size="small" className="summary-text">
                  {currentAnalysis.summary}
                </Text>
              </Box>

              {/* Analysis Results */}
              <Box className="analysis-results">
                <Text weight="semibold" size="small">Structured Analysis:</Text>
                {renderAnalysisResults()}
              </Box>

              {/* Timestamp */}
              <Box className="timestamp">
                <Text size="small" color="subtlest">
                  Analyzed: {currentAnalysis.timestamp.toLocaleString()}
                </Text>
              </Box>
            </Stack>
          ) : (
            <Box className="no-analysis">
              <Text>No analysis available for this update.</Text>
              {onAnalyze && (
                <Button 
                  appearance="primary" 
                  onClick={handleAnalyze}
                  isDisabled={isAnalyzing}
                  className="analyze-button"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner size="small" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Update'
                  )}
                </Button>
              )}
            </Box>
          )}
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalDialog>
  );
};

export default ProjectAnalysisModal;
