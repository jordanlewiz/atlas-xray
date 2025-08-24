// Test script for AI quality analysis
const { analyzeUpdateQuality } = require('./src/services/AnalysisService.ts');

async function testAIQuality() {
  console.log('🧪 Testing AI Quality Analysis System...\n');
  
  const testUpdates = [
    {
      text: 'We have decided to pause this project due to resource constraints. The team needs to focus on higher priority initiatives. We will resume in Q2 when additional resources become available.',
      type: 'paused',
      state: 'paused'
    },
    {
      text: 'Project is behind schedule due to unexpected technical challenges. We are working with the engineering team to resolve the issues and expect to be back on track within 2 weeks.',
      type: 'update',
      state: 'off-track'
    },
    {
      text: 'New initiative has been prioritized due to customer demand and strategic importance. This will help us capture market share and meet our Q4 revenue targets.',
      type: 'new',
      state: 'on-track'
    }
  ];
  
  for (let i = 0; i < testUpdates.length; i++) {
    const update = testUpdates[i];
    console.log(`📝 Test Update ${i + 1}:`);
    console.log(`Type: ${update.type}, State: ${update.state}`);
    console.log(`Text: "${update.text}"\n`);
    
    try {
      console.log('🤖 Analyzing with AI...');
      const result = await analyzeUpdateQuality(update.text, update.type, update.state);
      
      console.log(`✅ Analysis Complete!`);
      console.log(`Score: ${result.overallScore.toFixed(1)}%`);
      console.log(`Quality: ${result.qualityLevel}`);
      console.log(`Summary: ${result.summary}`);
      console.log(`Analysis Criteria: ${result.analysis.length}`);
      console.log(`Missing Info: ${result.missingInfo.length}`);
      console.log(`Recommendations: ${result.recommendations.length}\n`);
      
    } catch (error) {
      console.error(`❌ Analysis Failed:`, error.message);
      console.log('');
    }
    
    if (i < testUpdates.length - 1) {
      console.log('─'.repeat(50));
      console.log('');
    }
  }
  
  console.log('🎯 Test Complete!');
}

// Run the test
testAIQuality().catch(console.error);
