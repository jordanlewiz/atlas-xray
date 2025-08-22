// Debug script to check database contents
// Run this in the browser console to see what's in the database

async function debugDatabase() {
  console.log('🔍 Debugging AtlasXray Database...');
  
  try {
    // Check if Dexie is available
    if (typeof Dexie === 'undefined') {
      console.error('❌ Dexie is not available');
      return;
    }
    
    // Try to access the database
    const db = Dexie.getDatabase('AtlasXrayDB');
    if (!db) {
      console.error('❌ Database not found');
      return;
    }
    
    console.log('✅ Database found:', db.name);
    
    // Check table counts
    try {
      const projectViewCount = await db.table('projectView').count();
      const projectUpdatesCount = await db.table('projectUpdates').count();
      const projectStatusHistoryCount = await db.table('projectStatusHistory').count();
      
      console.log('📊 Table counts:');
      console.log('  - projectView:', projectViewCount);
      console.log('  - projectUpdates:', projectUpdatesCount);
      console.log('  - projectStatusHistory:', projectStatusHistoryCount);
      
      // Check if we have any data
      if (projectViewCount === 0) {
        console.warn('⚠️  No projects found in database');
      }
      
      if (projectUpdatesCount === 0) {
        console.warn('⚠️  No project updates found in database');
      }
      
      // Show sample data if available
      if (projectViewCount > 0) {
        const sampleProject = await db.table('projectView').first();
        console.log('📋 Sample project:', sampleProject);
      }
      
      if (projectUpdatesCount > 0) {
        const sampleUpdate = await db.table('projectUpdates').first();
        console.log('📋 Sample update:', sampleUpdate);
      }
      
    } catch (error) {
      console.error('❌ Error accessing tables:', error);
    }
    
  } catch (error) {
    console.error('❌ Database debug failed:', error);
  }
}

// Also check chrome.storage.local for quality data
async function debugChromeStorage() {
  console.log('🔍 Debugging Chrome Storage...');
  
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      console.error('❌ Chrome storage not available');
      return;
    }
    
    const allData = await chrome.storage.local.get(null);
    const qualityKeys = Object.keys(allData).filter(key => key.startsWith('quality:'));
    
    console.log('📊 Chrome storage:');
    console.log('  - Total keys:', Object.keys(allData).length);
    console.log('  - Quality keys:', qualityKeys.length);
    
    if (qualityKeys.length > 0) {
      console.log('  - Quality data found:', qualityKeys.slice(0, 5));
      if (qualityKeys.length > 5) {
        console.log('    ... and', qualityKeys.length - 5, 'more');
      }
    }
    
  } catch (error) {
    console.error('❌ Chrome storage debug failed:', error);
  }
}

// Run both debug functions
debugDatabase();
debugChromeStorage();

console.log('💡 Run debugDatabase() or debugChromeStorage() individually if needed');
