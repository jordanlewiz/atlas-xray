/**
 * Test script to verify analysis system functionality
 * Run this in the browser console to test the analysis
 */

async function testAnalysisSystem() {
  console.log('🧪 Testing Atlas Xray Analysis System...');
  
  try {
    // Test 1: Check if background script is accessible
    console.log('📡 Test 1: Background script communication...');
    const pingResponse = await chrome.runtime.sendMessage({ type: 'PING' });
    if (pingResponse && pingResponse.success) {
      console.log('✅ Background script communication working');
    } else {
      console.log('❌ Background script communication failed');
      return;
    }
    
    // Test 2: Test AI analysis
    console.log('🤖 Test 2: AI analysis capability...');
    const testUpdate = {
      type: 'ANALYZE_UPDATE_QUALITY',
      updateId: 'test_update_1',
      updateText: 'This project is currently off-track due to resource constraints. We need additional developers to meet the deadline. The impact will be a 2-week delay in delivery.',
      updateType: 'off-track',
      state: 'off-track'
    };
    
    const analysisResponse = await chrome.runtime.sendMessage(testUpdate);
    if (analysisResponse && analysisResponse.success) {
      console.log('✅ AI analysis working:', analysisResponse.result);
    } else {
      console.log('❌ AI analysis failed:', analysisResponse?.error);
    }
    
    // Test 3: Check memory stats
    console.log('💾 Test 3: Memory management...');
    const memoryResponse = await chrome.runtime.sendMessage({ type: 'GET_MEMORY_STATS' });
    if (memoryResponse && memoryResponse.success) {
      console.log('✅ Memory monitoring working:', memoryResponse.summary);
    } else {
      console.log('❌ Memory monitoring failed');
    }
    
    // Test 4: Force cleanup
    console.log('🧹 Test 4: Memory cleanup...');
    const cleanupResponse = await chrome.runtime.sendMessage({ type: 'FORCE_CLEANUP' });
    if (cleanupResponse && cleanupResponse.success) {
      console.log('✅ Memory cleanup working');
    } else {
      console.log('❌ Memory cleanup failed');
    }
    
    console.log('🎉 Analysis system test completed!');
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Test multiple analysis requests
async function testMultipleAnalyses() {
  console.log('🧪 Testing multiple concurrent analyses...');
  
  const testUpdates = [
    {
      updateId: 'test_1',
      updateText: 'Project is on track and progressing well. Team is meeting all milestones.',
      updateType: 'general',
      state: 'on-track'
    },
    {
      updateId: 'test_2', 
      updateText: 'Project paused due to client feedback. Will resume next week after review.',
      updateType: 'paused',
      state: 'paused'
    },
    {
      updateId: 'test_3',
      updateText: 'Project at risk due to technical challenges. Need additional expertise.',
      updateType: 'at-risk',
      state: 'at-risk'
    }
  ];
  
  try {
    const promises = testUpdates.map(update => 
      chrome.runtime.sendMessage({
        type: 'ANALYZE_UPDATE_QUALITY',
        ...update
      })
    );
    
    const results = await Promise.all(promises);
    console.log('📊 Multiple analysis results:', results);
    
    const successCount = results.filter(r => r && r.success).length;
    console.log(`✅ ${successCount}/${results.length} analyses completed successfully`);
    
  } catch (error) {
    console.error('💥 Multiple analysis test failed:', error);
  }
}

// Export functions for console use
window.testAtlasXrayAnalysis = testAnalysisSystem;
window.testMultipleAtlasXrayAnalyses = testMultipleAnalyses;

console.log('🧪 Atlas Xray test functions loaded. Use:');
console.log('- testAtlasXrayAnalysis() - Test basic functionality');
console.log('- testMultipleAtlasXrayAnalyses() - Test concurrent analyses');
