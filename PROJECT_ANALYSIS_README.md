# Project Analysis with Transformers.js

This Chrome extension now includes AI-powered project update analysis using Transformers.js. It automatically analyzes project updates for sentiment, extracts structured information, and provides concise summaries.

## Features

### 🤖 **AI Analysis**
- **Sentiment Analysis**: Determines if updates are positive, negative, or neutral
- **Extractive QA**: Answers 15 predefined questions about each update
- **AI Summary**: Generates concise TL;DR summaries
- **Confidence Scoring**: Identifies clearly stated vs. missing information

### 📊 **Structured Analysis**
The system analyzes updates against these fixed criteria:

| ID | Question |
|----|----------|
| `initiative` | Which initiative or milestone is discussed? |
| `date_change` | Did the date change? If yes, what is the new date? |
| `reason` | What is the reason for the date change? |
| `impact_scope` | What is the impact on scope? |
| `impact_time` | What is the impact on timeline or schedule? |
| `impact_cost` | What is the impact on cost or budget? |
| `impact_risk` | What is the impact on risk or quality? |
| `decision_making` | How was this decision made? Who decided and what inputs were used? |
| `dependencies` | What dependencies are affected? |
| `stakeholders` | Which stakeholders were informed or need to be informed? |
| `support_needed` | Is any support needed? What is the specific ask and by whom? |
| `mitigation_plan` | What mitigation or recovery actions are proposed? |
| `next_steps` | What are the next steps and who owns them? |
| `risks` | What new or heightened risks are mentioned? |
| `confidence_evidence` | What confidence, evidence, or data is cited to support this update? |

### 💾 **Local-Only Processing**
- **No Server Required**: All AI processing happens locally in the browser
- **No API Keys**: Uses pre-trained models from Hugging Face
- **Privacy First**: Your data never leaves your device
- **Offline Capable**: Works without internet connection after initial model download

### 🔄 **Automatic Monitoring**
- **Background Processing**: Automatically analyzes new project updates
- **Smart Caching**: Avoids re-analyzing identical text
- **Real-time Updates**: Shows analysis results as they complete
- **Notification System**: Alerts when analysis is complete

## Architecture

### Core Components

1. **`ProjectAnalyzer`** (`src/utils/projectAnalyzer.ts`)
   - Handles AI model initialization and management
   - Performs sentiment analysis, QA extraction, and summarization
   - Manages confidence scoring and result grouping

2. **`AnalysisDatabase`** (`src/utils/analysisDatabase.ts`)
   - Dexie-based storage for analysis results
   - Caching system for performance optimization
   - Export/import functionality for data portability

3. **`ProjectUpdateWatcher`** (`src/background/projectUpdateWatcher.js`)
   - Background service worker monitoring for new updates
   - Automatic analysis triggering
   - Notification management

4. **`ProjectAnalysisModal`** (`src/components/ProjectAnalysis/ProjectAnalysisModal.tsx`)
   - React component for displaying analysis results
   - Interactive UI with expandable sections
   - Manual analysis triggering

5. **`useProjectAnalysis`** (`src/hooks/useProjectAnalysis.ts`)
   - React hooks for managing analysis state
   - Database operations and error handling
   - Real-time updates and caching

### AI Models Used

- **Sentiment Analysis**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Question Answering**: `distilbert-base-cased-distilled-squad`
- **Summarization**: `sshleifer-tiny-cnn`

## Usage

### Automatic Analysis

1. **Background Processing**: The extension automatically monitors for new project updates
2. **Real-time Analysis**: New updates are analyzed as they appear
3. **Notifications**: Chrome notifications alert when analysis is complete
4. **Storage**: Results are stored locally in IndexedDB

### Manual Analysis

```typescript
import { useProjectAnalysis } from '../hooks/useProjectAnalysis';

function MyComponent() {
  const { analyzeUpdate, currentAnalysis, isLoading } = useProjectAnalysis();
  
  const handleAnalyze = async () => {
    await analyzeUpdate('PROJ-123', 'update-456', 'Project update text...');
  };
  
  return (
    <div>
      <button onClick={handleAnalyze} disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze Update'}
      </button>
      
      {currentAnalysis && (
        <div>
          <h3>Analysis Results</h3>
          <p>Sentiment: {currentAnalysis.analysis.sentiment.label}</p>
          <p>Summary: {currentAnalysis.analysis.summary}</p>
        </div>
      )}
    </div>
  );
}
```

### Database Operations

```typescript
import { analysisDB } from '../utils/analysisDatabase';

// Store analysis
const id = await analysisDB.storeAnalysis(projectId, updateId, text, analysis);

// Retrieve analysis
const analysis = await analysisDB.getAnalysis(projectId, updateId);

// Get project summaries
const summaries = await analysisDB.getAllProjectSummaries();

// Export data
const data = await analysisDB.exportData();
```

## Configuration

### Model Loading

Models are downloaded automatically on first use:
- **Initial Download**: ~50-100MB (one-time)
- **Caching**: Models cached locally for subsequent use
- **Updates**: Models can be updated via extension updates

### Performance Settings

```typescript
// In projectUpdateWatcher.js
const WATCH_INTERVAL = 30000; // Check every 30 seconds
const MAX_TEXT_LENGTH = 2000; // Maximum text length for analysis
const CACHE_DURATION_HOURS = 24; // Cache analysis results for 24 hours
```

### Confidence Thresholds

```typescript
// In projectAnalyzer.ts
const missing = confidence < 0.25; // Treat low confidence as missing
```

## Integration with Existing Database

To integrate with your existing Dexie database, update the `getNewUpdatesFromDexie()` function in `projectUpdateWatcher.js`:

```typescript
async function getNewUpdatesFromDexie() {
  try {
    // Example: Check for updates that don't have analysis results yet
    const updates = await yourExistingDB.projectUpdates
      .where('hasAnalysis')
      .equals(false)
      .limit(10)
      .toArray();
    
    return updates.map(update => ({
      projectId: update.projectId,
      updateId: update.id,
      text: update.content || update.description
    }));
    
  } catch (error) {
    console.error('Failed to get updates from Dexie:', error);
    return [];
  }
}
```

## Error Handling

The system includes comprehensive error handling:

- **Model Loading Failures**: Graceful fallbacks to basic analysis
- **Analysis Errors**: Detailed error logging and user feedback
- **Database Failures**: Automatic retry mechanisms
- **Network Issues**: Offline mode support after initial setup

## Performance Considerations

- **Lazy Loading**: Models only load when first needed
- **Caching**: Analysis results cached to avoid re-computation
- **Background Processing**: Analysis runs in service worker
- **Text Truncation**: Long updates are truncated for performance
- **Batch Processing**: Multiple updates processed efficiently

## Security & Privacy

- **Local Processing**: All AI analysis happens in your browser
- **No Data Transmission**: Your project updates never leave your device
- **Model Verification**: Uses verified Hugging Face models
- **Permission Minimal**: Only requests necessary Chrome permissions

## Troubleshooting

### Common Issues

1. **Models Not Loading**
   - Check internet connection for initial download
   - Clear browser cache and reload extension
   - Verify sufficient disk space (~100MB)

2. **Analysis Failing**
   - Check browser console for error messages
   - Verify text length (max 2000 characters)
   - Ensure Dexie database is accessible

3. **Performance Issues**
   - Reduce `WATCH_INTERVAL` for less frequent checking
   - Clear expired cache entries
   - Check for large numbers of stored analyses

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('debug', 'true');
```

## Future Enhancements

- **Custom Questions**: Allow users to define their own analysis criteria
- **Model Selection**: Choose between different AI models
- **Batch Analysis**: Process multiple updates simultaneously
- **Export Formats**: Support for CSV, JSON, and PDF exports
- **Integration APIs**: Connect with external project management tools

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review the troubleshooting section above
3. Check the extension's GitHub repository
4. Verify Chrome extension permissions are enabled
