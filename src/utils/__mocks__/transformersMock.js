// Mock implementation of @xenova/transformers for testing
const mockPipeline = jest.fn();

// Mock sentiment analysis
mockPipeline.mockImplementation((task, model) => {
  if (task === 'sentiment-analysis') {
    return Promise.resolve((text) => Promise.resolve([{
      label: 'POSITIVE',
      score: 0.8
    }]));
  }
  
  // Mock question-answering
  if (task === 'question-answering') {
    return Promise.resolve((question, context) => Promise.resolve({
      answer: 'Mock answer from AI',
      score: 0.75,
      start: 0,
      end: 20
    }));
  }
  
  // Mock summarization
  if (task === 'summarization') {
    return Promise.resolve((text, options) => Promise.resolve([{
      summary_text: 'This is a mock AI-generated summary of the project update.'
    }]));
  }
  
  // Default mock
  return Promise.resolve((...args) => Promise.resolve({
    result: 'Mock result',
    confidence: 0.8
  }));
});

// Mock classes
class MockAutoTokenizer {
  static from_pretrained(model) {
    return Promise.resolve(new MockAutoTokenizer());
  }
  
  encode(text) {
    return Promise.resolve([1, 2, 3, 4, 5]);
  }
}

class MockAutoModelForSequenceClassification {
  static from_pretrained(model) {
    return Promise.resolve(new MockAutoModelForSequenceClassification());
  }
  
  predict(input) {
    return Promise.resolve({ result: 'mock' });
  }
}

class MockAutoModelForQuestionAnswering {
  static from_pretrained(model) {
    return Promise.resolve(new MockAutoModelForQuestionAnswering());
  }
  
  predict(input) {
    return Promise.resolve({ result: 'mock' });
  }
}

// Mock environment
const mockEnv = {
  allowLocalModels: false,
  allowRemoteModels: true,
  localModelPath: '',
  useBrowserCache: true,
  useCustomCache: false
};

module.exports = {
  pipeline: mockPipeline,
  AutoTokenizer: MockAutoTokenizer,
  AutoModelForSequenceClassification: MockAutoModelForSequenceClassification,
  AutoModelForQuestionAnswering: MockAutoModelForQuestionAnswering,
  env: mockEnv
};
