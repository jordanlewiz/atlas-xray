import { db, upsertProjectUpdates } from '../utils/database';
import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';
import { PROJECT_VIEW_QUERY } from '../graphql/projectViewQuery';
import { PROJECT_UPDATES_QUERY } from '../graphql/projectUpdatesQuery';


export interface PipelineState {
  projectsOnPage: number;
  projectIds: string[]; // Store the actual project IDs found
  projectsStored: number;
  projectUpdatesStored: number;
  projectUpdatesAnalysed: number;
  isProcessing: boolean;
  lastUpdated: Date;
  currentStage: 'idle' | 'scanning' | 'fetching-projects' | 'fetching-updates' | 'queuing-analysis' | 'processing-analysis';
  error?: string;
}

export interface ProjectMatch {
  projectId: string;
  cloudId: string;
  href: string;
}

export interface ProjectUpdate {
  id: string;
  projectKey: string;
  summary: string;
  state: string;
  creationDate: string;
  // Quality analysis fields (populated by AI analyzer)
  analyzed?: boolean;
  analysisDate?: string;
  updateQuality?: number;
  qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor';
  qualityAnalysis?: string; // JSON string of detailed analysis
  qualitySummary?: string;
  qualityRecommendations?: string; // JSON string of recommendations
  qualityMissingInfo?: string; // JSON string of missing information
}

export class ProjectPipeline {
  private state: PipelineState;
  private rateLimitQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private maxRequestsPerSecond = 10; // Project view requests per second
  private maxUpdateRequestsPerSecond = 3; // Much more conservative for updates (was 10)
  private lastRequestTime = 0;
  private lastUpdateRequestTime = 0; // Separate timing for update requests
  private mutationObserver: MutationObserver | null = null;
  private lastScanTime = 0;
  private scanDebounceTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      projectsOnPage: 0,
      projectIds: [], // Initialize empty array
      projectsStored: 0,
      projectUpdatesStored: 0,
      projectUpdatesAnalysed: 0,
      isProcessing: false,
      lastUpdated: new Date(),
      currentStage: 'idle'
    };
    
    // Initialize state with existing database entries
    this.initializeFromDatabase();
    
    // Start watching for DOM changes to detect new projects
    this.startWatchingForNewProjects();
  }

  // Watch for new projects being added to the page
  private startWatchingForNewProjects(): void {
    try {
      // Only run in browser context
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.log('[AtlasXray] Not in browser context, skipping DOM observer');
        return;
      }

      console.log('[AtlasXray] 🔍 Starting DOM observer for new projects...');
      
      // Create mutation observer to watch for new content
      this.mutationObserver = new MutationObserver((mutations) => {
        // Check if any mutations added new nodes
        const hasNewContent = mutations.some(mutation => 
          mutation.type === 'childList' && 
          mutation.addedNodes.length > 0
        );
        
        if (hasNewContent) {
          console.log('[AtlasXray] 🔍 DOM changes detected, checking for new projects...');
          this.debouncedRescan();
        }
      });

      // Start observing the document body for changes
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[AtlasXray] ✅ DOM observer started successfully');
    } catch (error) {
      console.warn('[AtlasXray] Failed to start DOM observer:', error);
    }
  }

  // Debounced rescan to avoid excessive scanning
  private debouncedRescan(): void {
    const now = Date.now();
    const timeSinceLastScan = now - this.lastScanTime;
    const minScanInterval = 2000; // Minimum 2 seconds between scans

    if (timeSinceLastScan < minScanInterval) {
      // Clear existing timeout and set new one
      if (this.scanDebounceTimeout) {
        clearTimeout(this.scanDebounceTimeout);
      }
      
      this.scanDebounceTimeout = setTimeout(() => {
        this.handleNewProjectsDetected();
      }, minScanInterval - timeSinceLastScan);
      return;
    }

    // Enough time has passed, scan immediately
    this.handleNewProjectsDetected();
  }

  // Handle when new projects are detected
  private async handleNewProjectsDetected(): Promise<void> {
    try {
      console.log('[AtlasXray] 🔍 New projects detected, starting rescan...');
      
      // Don't interrupt if already processing
      if (this.state.isProcessing) {
        console.log('[AtlasXray] ⏳ Pipeline already processing, skipping rescan');
        return;
      }

      // Quick scan to check if project count increased
      const newProjectCount = await this.scanProjectsOnPage(true); // true = isRescan
      const currentState = this.getState();
      
      if (newProjectCount > currentState.projectsStored) {
        console.log(`[AtlasXray] 🆕 Project count increased from ${currentState.projectsStored} to ${newProjectCount}, processing new projects...`);
        
        // Process only the new projects
        await this.fetchAndStoreProjects();
        
        // Update the last scan time
        this.lastScanTime = Date.now();
        
        console.log('[AtlasXray] ✅ New projects processed successfully');
      } else {
        console.log('[AtlasXray] ℹ️ No new projects found during rescan');
      }
    } catch (error) {
      console.error('[AtlasXray] ❌ Error during new project detection:', error);
    }
  }

  // Clean up mutation observer
  public destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
      console.log('[AtlasXray] 🧹 DOM observer cleaned up');
    }
    
    if (this.scanDebounceTimeout) {
      clearTimeout(this.scanDebounceTimeout);
      this.scanDebounceTimeout = null;
    }
  }

  // Refresh counts from database to ensure accuracy
  public async refreshCounts(): Promise<void> {
    try {
      console.log('[AtlasXray] 🔄 Refreshing counts from database...');
      
      // Get current counts from database
      const projects = await db.projectView.toArray();
      const updates = await db.projectUpdates.toArray();
      const analyzedUpdates = updates.filter(u => u.analyzed === true); // Explicit boolean check
      
      // Update state with accurate counts
      this.updateState({
        projectsStored: projects.length,
        projectUpdatesStored: updates.length,
        projectUpdatesAnalysed: analyzedUpdates.length,
        lastUpdated: new Date()
      });
      
      console.log(`[AtlasXray] ✅ Counts refreshed: ${projects.length} projects, ${updates.length} updates, ${analyzedUpdates.length} analyzed`);
    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to refresh counts:', error);
    }
  }

  // Efficient count refresh that only updates if counts have changed
  public async refreshCountsIfNeeded(): Promise<void> {
    try {
      // Get current counts from database
      const projects = await db.projectView.toArray();
      const updates = await db.projectUpdates.toArray();
      const analyzedUpdates = updates.filter(u => u.analyzed === true);
      
      const currentState = this.getState();
      
      // Only update if counts have actually changed
      if (currentState.projectsStored !== projects.length ||
          currentState.projectUpdatesStored !== updates.length ||
          currentState.projectUpdatesAnalysed !== analyzedUpdates.length) {
        
        console.log(`[AtlasXray] 🔄 Counts changed, updating: projects ${currentState.projectsStored}→${projects.length}, updates ${currentState.projectUpdatesStored}→${updates.length}, analyzed ${currentState.projectUpdatesAnalysed}→${analyzedUpdates.length}`);
        
        this.updateState({
          projectsStored: projects.length,
          projectUpdatesStored: updates.length,
          projectUpdatesAnalysed: analyzedUpdates.length,
          lastUpdated: new Date()
        });
      } else {
        console.log('[AtlasXray] ℹ️ Counts unchanged, skipping update');
      }
    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to refresh counts:', error);
    }
  }

  // Trigger initial ProjectUpdates fetch for existing projects (last 4 weeks)
  public async triggerInitialUpdatesFetch(): Promise<void> {
    try {
      console.log('[AtlasXray] 🚀 Triggering initial updates fetch for all existing projects...');
      
      const existingProjects = await db.projectView.toArray();
      console.log(`[AtlasXray] 📊 Found ${existingProjects.length} existing projects to fetch updates for`);
      
      // Process projects in parallel with rate limiting
      const fetchPromises = existingProjects.map(async (project) => {
        try {
          // Small delay between requests to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
          
          await this.triggerProjectUpdatesFetch(project.projectKey, true);
        } catch (error) {
          console.error(`[AtlasXray] ❌ Failed to fetch initial updates for ${project.projectKey}:`, error);
        }
      });
      
      // Wait for all initial fetches to complete
      await Promise.all(fetchPromises);
      console.log('[AtlasXray] ✅ Initial updates fetch complete for all existing projects');
      
    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to trigger initial updates fetch:', error);
    }
  }

  // Force refresh counts from database (useful for debugging count mismatches)
  public async forceRefreshCounts(): Promise<void> {
    try {
      console.log('[AtlasXray] 🔄 Force refreshing counts from database...');
      
      // Get current counts from database
      const projects = await db.projectView.toArray();
      const updates = await db.projectUpdates.toArray();
      const analyzedUpdates = updates.filter(u => u.analyzed === true);
      
      // Update state with accurate counts
      this.updateState({
        projectsStored: projects.length,
        projectUpdatesStored: updates.length,
        projectUpdatesAnalysed: analyzedUpdates.length,
        lastUpdated: new Date()
      });
      
      console.log(`[AtlasXray] ✅ Force refresh complete: ${projects.length} projects, ${updates.length} updates, ${analyzedUpdates.length} analyzed`);
    } catch (error) {
      console.error('[AtlasXray] ❌ Failed to force refresh counts:', error);
    }
  }

  // Initialize state from existing database entries
  private async initializeFromDatabase(): Promise<void> {
    try {
      // Check for existing projects in database
      const existingProjects = await db.projectView.toArray();
      const existingUpdates = await db.projectUpdates.toArray();
      const analyzedUpdates = existingUpdates.filter(u => u.analyzed === true);
      
      if (existingProjects.length > 0 || existingUpdates.length > 0) {
        console.log(`[AtlasXray] 📊 Initializing from database: ${existingProjects.length} projects, ${existingUpdates.length} updates, ${analyzedUpdates.length} analyzed`);
        
        this.updateState({
          projectsStored: existingProjects.length,
          projectUpdatesStored: existingUpdates.length,
          projectUpdatesAnalysed: analyzedUpdates.length,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.warn(`[AtlasXray] Could not initialize from database:`, error);
    }
  }

  // Get current pipeline state
  getState(): PipelineState {
    return { ...this.state };
  }

  // Subscribe to state changes
  subscribe(callback: (state: PipelineState) => void): () => void {
    // Simple callback system - in production you might want a proper pub/sub
    const interval = setInterval(() => callback(this.getState()), 100);
    return () => clearInterval(interval);
  }

  // Stage 1a: Scan DOM for projects
  async scanProjectsOnPage(isRescan: boolean = false): Promise<number> {
    // Don't update state if this is a rescan (to avoid UI flicker)
    if (!isRescan) {
      this.updateState({ 
        currentStage: 'scanning',
        isProcessing: true 
      });
    }

    try {
      console.log(`[AtlasXray] 🔍 ${isRescan ? 'Re-scanning' : 'Scanning'} page: ${window.location.href}`);
      
      // Regex for /o/{cloudId}/s/{sectionId}/project/{ORG-123}
      const projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;
      
      // Get all links on the page
      const links = Array.from(document.querySelectorAll('a[href]'));
      const hrefs = links.map(link => link.getAttribute('href'));
      
      console.log(`[AtlasXray] 🔍 Found ${links.length} total links on page`);
      
      // Find matching project links using the specific pattern
      const seen = new Set<string>();
      const projectIds: string[] = [];
      
      hrefs.forEach(href => {
        if (!href) return;
        const match = href.match(projectLinkPattern);
        if (match && match[3]) {
          const projectId = match[3];
          if (!seen.has(projectId)) {
            seen.add(projectId);
            projectIds.push(projectId);
            if (projectIds.length <= 5) { // Log first 5 for debugging
              console.log(`[AtlasXray] ✅ Found project: ${projectId} from ${href}`);
            }
          }
        }
      });
      
      console.log(`[AtlasXray] 🔍 Final project IDs found: ${projectIds.length} projects`);
      
      // Only update state if this is not a rescan (to avoid UI flicker during auto-detection)
      if (!isRescan) {
        this.updateState({
          projectsOnPage: projectIds.length,
          projectIds: projectIds,
          currentStage: 'idle',
          isProcessing: false,
          lastUpdated: new Date()
        });
      } else {
        // For rescans, only update the project count and IDs, keep other state intact
        this.updateState({
          projectsOnPage: projectIds.length,
          projectIds: projectIds,
          lastUpdated: new Date()
        });
      }

      return projectIds.length;
    } catch (error) {
      if (!isRescan) {
        this.updateState({
          currentStage: 'idle',
          isProcessing: false,
          error: `DOM scan failed: ${error}`
        });
      }
      throw error;
    }
  }

  // Stage 1b: Fetch and store project data
  async fetchAndStoreProjects(): Promise<number> {
    this.updateState({ 
      currentStage: 'fetching-projects',
      isProcessing: true 
    });

    try {
      // Get the actual project IDs that were found by the scanner
      const currentState = this.getState();
      const actualProjectIds = currentState.projectIds || [];
      
      console.log(`[AtlasXray] 📋 Processing ${actualProjectIds.length} actual projects from scanner:`, actualProjectIds);
      
      // Get current stored count from state (don't re-query database)
      const currentStoredCount = currentState.projectsStored || 0;
      console.log(`[AtlasXray] 📊 Current stored count from state: ${currentStoredCount}`);
      
      // Get the actual count of existing projects in the database
      const existingProjects = await db.projectView.toArray();
      const existingProjectsCount = existingProjects.length;
      console.log(`[AtlasXray] 📊 Existing projects in database: ${existingProjectsCount}`);
      
      // Filter out invalid projects
      const validProjects = actualProjectIds.filter(p => p && p.trim()).map(projectId => ({
        projectId: projectId.trim(),
        cloudId: 'unknown',
        href: `#${projectId}`
      }));

      // Process projects with controlled concurrency (faster than sequential)
      let newlyStoredCount = 0;
      let hasErrors = false;
      let failedProjects = 0;
      let skippedProjects = 0;
      
      console.log(`[AtlasXray] 🚀 Starting to process ${validProjects.length} projects with concurrency...`);
      
      // Process projects in smaller batches to avoid overwhelming the API
      const batchSize = 3; // Reduced from 5 to 3 projects at a time to spread out API calls
      const batches = [];
      
      for (let i = 0; i < validProjects.length; i += batchSize) {
        batches.push(validProjects.slice(i, i + batchSize));
      }
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`[AtlasXray] 📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} projects)`);
        
        // Process batch in parallel with rate limiting
        const batchPromises = batch.map(async (project) => {
          try {
            await this.rateLimitedRequest(async () => {
              // Only fetch project view data, not updates (to avoid rate limiting)
              const result = await this.fetchAndStoreProjectViewOnly(project);
              if (result.success) {
                // Only count new projects, not updates to existing ones
                if (result.isNewProject) {
                  newlyStoredCount++;
                  console.log(`[AtlasXray] 🆕 Counted new project: ${project.projectId} (total new: ${newlyStoredCount})`);
                } else {
                  skippedProjects++;
                  console.log(`[AtlasXray] 🔄 Updated existing project: ${project.projectId} (skipped: ${skippedProjects})`);
                }
                
                // Update progress with total count (existing + newly stored)
                this.updateState({
                  projectsStored: existingProjectsCount + newlyStoredCount,
                  lastUpdated: new Date()
                });
              } else {
                // Project failed to store - log the failure
                failedProjects++;
                console.error(`[AtlasXray] ❌ Failed to store project: ${project.projectId} (failed: ${failedProjects})`);
              }
            });
          } catch (error) {
            console.error(`[AtlasXray] 💥 Exception storing project ${project.projectId}:`, error);
            hasErrors = true;
            failedProjects++;
          }
        });
        
        // Wait for batch to complete before moving to next batch
        await Promise.all(batchPromises);
        
        // Log batch progress
        const totalProcessed = (batchIndex + 1) * batchSize;
        const progress = Math.min(totalProcessed, validProjects.length);
        const percentage = Math.round((progress / validProjects.length) * 100);
        console.log(`[AtlasXray] 📊 Batch ${batchIndex + 1} complete! Progress: ${progress}/${validProjects.length} (${percentage}%)`);
        
        // Small delay between batches to be respectful to the API
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Increased from 100ms to 200ms
        }
        
        // Additional delay after each batch to spread out update requests
        // This helps prevent overwhelming the API with too many update requests
        if (batchIndex < batches.length - 1) {
          const updateThrottleDelay = 500; // 500ms delay between batches for updates
          console.log(`[AtlasXray] ⏳ Throttling update requests, waiting ${updateThrottleDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, updateThrottleDelay));
        }
      }
      
      // Log comprehensive summary
      console.log(`[AtlasXray] 📊 Processing Summary:`);
      console.log(`  - Total projects: ${validProjects.length}`);
      console.log(`  - New projects stored: ${newlyStoredCount}`);
      console.log(`  - Existing projects updated: ${skippedProjects}`);
      console.log(`  - Failed projects: ${failedProjects}`);
      console.log(`  - Success rate: ${((newlyStoredCount + skippedProjects) / validProjects.length * 100).toFixed(1)}%`);

      // If all projects failed to store data, set an error state
      if (newlyStoredCount === 0 && validProjects.length > 0) {
        this.updateState({
          currentStage: 'idle',
          isProcessing: false,
          error: 'All projects failed to store due to API errors',
          lastUpdated: new Date()
        });
      } else {
        this.updateState({
          currentStage: 'idle',
          isProcessing: false,
          lastUpdated: new Date()
        });
      }
      
      // Always get the final count from the database to ensure accuracy
      const finalProjects = await db.projectView.toArray();
      const finalStoredCount = finalProjects.length;
      console.log(`[AtlasXray] 📊 Scanner found ${currentState.projectsOnPage} projects, newly stored ${newlyStoredCount} projects, total stored ${finalStoredCount} projects (verified from database)`);

      // Update the final state with the accurate count
      this.updateState({
        projectsStored: finalStoredCount,
        lastUpdated: new Date()
      });

      return finalStoredCount;
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `Project fetch failed: ${error}`
      });
      throw error;
    }
  }

  // Stage 2: Updates are now fetched on-demand to avoid rate limiting
  async fetchAndStoreUpdates(): Promise<number> {
    this.updateState({ 
      currentStage: 'fetching-updates',
      isProcessing: true 
    });

    try {
      // Updates are now fetched on-demand when timeline is opened
      // This prevents rate limiting during initial pipeline execution
      console.log(`[AtlasXray] 📊 Updates will be fetched on-demand to avoid rate limiting`);
      
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

      return 0; // No updates fetched during main pipeline
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `Updates stage failed: ${error}`
      });
      throw error;
    }
  }

  // Stage 3a & 3b: Queue and process AI analysis
  async queueAndProcessAnalysis(): Promise<number> {
    this.updateState({ 
      currentStage: 'queuing-analysis',
      isProcessing: true 
    });

    try {
      const storedUpdates = await db.projectUpdates.toArray();
      let analyzedCount = 0;

      // Queue all updates for analysis
      for (const update of storedUpdates) {
        try {
          await this.rateLimitedRequest(async () => {
            await this.queueUpdateForAnalysis(update);
            analyzedCount++;
            
            // Update progress
            this.updateState({
              projectUpdatesAnalysed: analyzedCount,
              lastUpdated: new Date()
            });
          });
        } catch (error) {
          console.error(`Failed to analyze update ${update.id}:`, error);
        }
      }

      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        lastUpdated: new Date()
      });

      return analyzedCount;
    } catch (error) {
      this.updateState({
        currentStage: 'idle',
        isProcessing: false,
        error: `Analysis failed: ${error}`
      });
      throw error;
    }
  }

  // Run complete pipeline
  async runCompletePipeline(): Promise<void> {
    try {
      // Pipeline starting - scan will set the project count
      console.log(`[AtlasXray] 🚀 Starting complete pipeline`);
      
      // Stage 1a: Scan DOM
      await this.scanProjectsOnPage();
      
      // Stage 1b: Fetch and store projects
      const projectsStored = await this.fetchAndStoreProjects();
      
      // If no projects were stored, check if there was an error and set it
      if (projectsStored === 0) {
        const currentState = this.getState();
        if (currentState.error) {
          // Error already set by fetchAndStoreProjects
          return;
        }
      }
      
      // Stage 2: Fetch and store updates
      await this.fetchAndStoreUpdates();
      
      // Stage 3: Queue and process analysis
      await this.queueAndProcessAnalysis();
      
      // Keep the scan results - don't restore to a potentially incorrect count
      this.updateState({
        isProcessing: false,
        lastUpdated: new Date(),
        error: undefined
      });
      
      console.log(`[AtlasXray] ✅ Pipeline complete - keeping scan results`);
    } catch (error) {
      this.updateState({
        isProcessing: false,
        error: `Pipeline failed: ${error}`
      });
      throw error;
    }
  }

  // Rate limiting helper with exponential backoff for 429 errors
  private async rateLimitedRequest<T>(requestFn: () => Promise<T>, retryCount = 0): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.maxRequestsPerSecond; // Convert to milliseconds

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
    
    try {
      return await requestFn();
    } catch (error: any) {
      // Handle 429 errors with exponential backoff
      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        if (retryCount < 3) { // Max 3 retries
          const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`[AtlasXray] ⏳ 429 error, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.rateLimitedRequest(requestFn, retryCount + 1);
        } else {
          console.error('[AtlasXray] ❌ Max retries reached for 429 error');
        }
      }
      throw error;
    }
  }

  // Separate rate limiting for update requests (much more conservative)
  private async rateLimitedUpdateRequest<T>(requestFn: () => Promise<T>, retryCount = 0): Promise<T> {
    const now = Date.now();
    const timeSinceLastUpdateRequest = now - this.lastUpdateRequestTime;
    const minInterval = 1000 / this.maxUpdateRequestsPerSecond; // Convert to milliseconds

    if (timeSinceLastUpdateRequest < minInterval) {
      const delay = minInterval - timeSinceLastUpdateRequest;
      console.log(`[AtlasXray] ⏳ Rate limiting update request, waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastUpdateRequestTime = Date.now();
    
    try {
      return await requestFn();
    } catch (error: any) {
      // Handle 429 errors with exponential backoff for updates
      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        if (retryCount < 3) { // Max 3 retries
          const backoffDelay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s (longer backoff for updates)
          console.log(`[AtlasXray] ⏳ 429 error on update request, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.rateLimitedUpdateRequest(requestFn, retryCount + 1);
        } else {
          console.error('[AtlasXray] ❌ Max retries reached for update request 429 error');
        }
      }
      throw error;
    }
  }

  // Helper methods
  private async fetchAndStoreProjectViewOnly(project: ProjectMatch): Promise<{ success: boolean; isNewProject: boolean }> {
    // Validate project ID before making API call
    if (!project.projectId || typeof project.projectId !== 'string' || project.projectId.trim() === '') {
      console.error(`Invalid project ID: ${project.projectId}`);
      return { success: false, isNewProject: false };
    }

    try {
      console.log(`[AtlasXray] 📥 Fetching project view data only for: ${project.projectId}`);
      
      let hasStoredData = false;
      let isNewProject = false;
      
      // Check if project already exists in database
      const existingProject = await db.projectView.get(project.projectId);
      if (!existingProject) {
        isNewProject = true;
        console.log(`[AtlasXray] 🆕 New project discovered: ${project.projectId}`);
        
        // Only fetch Project View data for NEW projects (no updates to avoid rate limiting)
        const projectViewVariables = {
          key: project.projectId.trim(),
          trackViewEvent: "DIRECT",
          workspaceId: null,
          onboardingKeyFilter: "PROJECT_SPOTLIGHT",
          areMilestonesEnabled: false,
          cloudId: project.cloudId || "",
          isNavRefreshEnabled: true
        };
        
        try {
          const { data } = await apolloClient.query({
            query: gql`${PROJECT_VIEW_QUERY}`,
            variables: projectViewVariables
          });
          
          if (data?.project) {
            // Store project view in IndexedDB
            await db.projectView.put({
              projectKey: project.projectId,
              raw: data.project
            });
            console.log(`[AtlasXray] ✅ Stored project view for ${project.projectId}`);
            hasStoredData = true;
            
            // 🚀 PARALLEL PROCESSING: Immediately trigger ProjectUpdates fetch (last 4 weeks)
            this.triggerProjectUpdatesFetch(project.projectId, true).catch(error => {
              console.error(`[AtlasXray] ❌ Failed to trigger updates fetch for ${project.projectId}:`, error);
            });
          } else {
            console.warn(`[AtlasXray] ⚠️ No project data returned for ${project.projectId} - data:`, data);
          }
        } catch (err) {
          console.error(`[AtlasXray] ❌ Failed to fetch project view data for projectId: ${project.projectId}`, err);
          if (err instanceof Error) {
            console.error(`[AtlasXray] ❌ Error details:`, {
              message: err.message,
              name: err.name
            });
          }
        }
      } else {
        // Project already exists - skip fetching and updating
        console.log(`[AtlasXray] ⏭️ Skipping existing project: ${project.projectId} (already in database)`);
        hasStoredData = true; // Consider it "successful" since we didn't need to do anything
        isNewProject = false; // This is an existing project, not a new one
      }
      
      // A project is considered successfully stored if we at least stored the project view
      if (hasStoredData) {
        console.log(`[AtlasXray] ✅ Completed project view fetch for: ${project.projectId}`);
        return { success: true, isNewProject }; // Return both success and new project status
      } else {
        console.log(`[AtlasXray] ❌ No project view data was stored for ${project.projectId} - API call failed`);
        return { success: false, isNewProject: false }; // Failed to store project data
      }
    } catch (error) {
      console.error(`[AtlasXray] Failed to fetch project ${project.projectId}:`, error);
      return { success: false, isNewProject: false }; // Failed to store project data
    }
  }

  // Fetch and store project updates for a specific project (lazy loading)
  // This method is called when the modal opens to get ALL remaining updates
  public async fetchAndStoreProjectUpdates(projectKey: string): Promise<number> {
    try {
      console.log(`[AtlasXray] 📥 Fetching updates for project: ${projectKey}`);
      
      // Fetch Project Updates with rate limiting
      const { data } = await this.rateLimitedUpdateRequest(async () => {
        return await apolloClient.query({
          query: gql`${PROJECT_UPDATES_QUERY}`,
          variables: { key: projectKey, isUpdatesTab: true }
        });
      });
      
      // Extract nodes from edges and store updates
      if (data?.project?.updates?.edges) {
        const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
        if (nodes.length > 0) {
          // Check which updates are already analyzed to avoid re-analysis
          const existingUpdates = await db.projectUpdates.where('projectKey').equals(projectKey).toArray();
          const existingUpdateIds = new Set(existingUpdates.map(u => u.id));
          
          // Filter out updates that are already analyzed
          const newUpdates = nodes.filter((node: any) => !existingUpdateIds.has(node.id));
          const alreadyAnalyzed = nodes.filter((node: any) => existingUpdateIds.has(node.id));
          
          if (newUpdates.length > 0) {
            await upsertProjectUpdates(newUpdates);
            console.log(`[AtlasXray] ✅ Stored ${newUpdates.length} new updates for ${projectKey} (${alreadyAnalyzed.length} already analyzed)`);
            
            // 🚀 PARALLEL PROCESSING: Immediately trigger analysis for new updates
            this.triggerAnalysisForUpdates(newUpdates).catch(error => {
              console.error(`[AtlasXray] ❌ Failed to trigger analysis for updates in ${projectKey}:`, error);
            });
          } else {
            console.log(`[AtlasXray] ℹ️ All ${nodes.length} updates for ${projectKey} are already analyzed`);
          }
          
          // Don't refresh counts here - will be done once at the end
          return newUpdates.length;
        }
      }
      
      console.log(`[AtlasXray] ℹ️ No updates found for project: ${projectKey}`);
      return 0;
      
    } catch (err) {
      console.error(`[AtlasXray] Failed to fetch project updates for projectKey: ${projectKey}`, err);
      return 0;
    }
  }

  // 🚀 PARALLEL PROCESSING: Trigger ProjectUpdates fetch immediately after ProjectView is saved
  private async triggerProjectUpdatesFetch(projectKey: string, isInitialFetch: boolean = false): Promise<void> {
    try {
      if (isInitialFetch) {
        // Initial fetch: Get last 4 weeks of updates
        console.log(`[AtlasXray] 🚀 Triggering initial ProjectUpdates fetch for ${projectKey} (last 4 weeks)`);
        
        // Calculate date 4 weeks ago
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        
        // Fetch updates with date filter (if the API supports it)
        const { data } = await this.rateLimitedUpdateRequest(async () => {
          return await apolloClient.query({
            query: gql`${PROJECT_UPDATES_QUERY}`,
            variables: { 
              key: projectKey, 
              isUpdatesTab: true,
              // Note: Add date filtering here if the API supports it
              // For now, we'll fetch all and filter client-side
            }
          });
        });
        
        if (data?.project?.updates?.edges) {
          const nodes = data.project.updates.edges.map((edge: any) => edge.node).filter(Boolean);
          
          // Check which updates are already analyzed to avoid re-analysis
          const existingUpdates = await db.projectUpdates.where('projectKey').equals(projectKey).toArray();
          const existingUpdateIds = new Set(existingUpdates.map(u => u.id));
          
          // Filter out updates that are already analyzed
          const newUpdates = nodes.filter((node: any) => !existingUpdateIds.has(node.id));
          const alreadyAnalyzed = nodes.filter((node: any) => existingUpdateIds.has(node.id));
          
          // Separate recent vs old updates for logging purposes
          const recentUpdates = newUpdates.filter((node: any) => {
            if (node.creationDate) {
              const updateDate = new Date(node.creationDate);
              return updateDate >= fourWeeksAgo;
            }
            return true; // Include updates without dates as recent
          });
          const olderUpdates = newUpdates.filter((node: any) => {
            if (node.creationDate) {
              const updateDate = new Date(node.creationDate);
              return updateDate < fourWeeksAgo;
            }
            return false;
          });
          
          if (newUpdates.length > 0) {
            // Store ALL new updates (both recent and older)
            await upsertProjectUpdates(newUpdates);
            console.log(`[AtlasXray] ✅ Initial fetch: Stored ${newUpdates.length} new updates for ${projectKey} (${recentUpdates.length} recent, ${olderUpdates.length} older, ${alreadyAnalyzed.length} already analyzed)`);
            
            // 🚀 PARALLEL PROCESSING: Immediately trigger analysis for ALL new updates (not just recent ones)
            this.triggerAnalysisForUpdates(newUpdates).catch(error => {
              console.error(`[AtlasXray] ❌ Failed to trigger analysis for initial updates in ${projectKey}:`, error);
            });
          } else {
            console.log(`[AtlasXray] ℹ️ Initial fetch: All ${nodes.length} updates for ${projectKey} are already analyzed`);
          }
        }
      } else {
        // Modal fetch: Get all remaining updates
        console.log(`[AtlasXray] 🔄 Modal requested: Fetching all remaining updates for ${projectKey}`);
        const count = await this.fetchAndStoreProjectUpdates(projectKey);
        console.log(`[AtlasXray] ✅ Modal fetch complete: ${count} new updates for ${projectKey}`);
      }
    } catch (error) {
      console.error(`[AtlasXray] ❌ Failed to trigger ProjectUpdates fetch for ${projectKey}:`, error);
    }
  }

  // 🚀 PARALLEL PROCESSING: Trigger analysis immediately after ProjectUpdate is stored
  private async triggerAnalysisForUpdates(updates: any[]): Promise<void> {
    try {
      console.log(`[AtlasXray] 🚀 Triggering analysis for ${updates.length} new updates`);
      
      // Process updates in parallel with rate limiting
      const analysisPromises = updates.map(async (update) => {
        try {
          // Small delay between analysis requests to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          
          await this.queueUpdateForAnalysis(update);
        } catch (error) {
          console.error(`[AtlasXray] ❌ Failed to analyze update ${update.id}:`, error);
        }
      });
      
      // Wait for all analysis to complete
      await Promise.all(analysisPromises);
      console.log(`[AtlasXray] ✅ Analysis complete for ${updates.length} updates`);
      
      // 🚀 REAL-TIME UPDATES: Dispatch custom event to notify UI components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('atlas-xray:analysis-complete', {
          detail: { updatesCount: updates.length }
        }));
      }
      
    } catch (error) {
      console.error(`[AtlasXray] ❌ Failed to trigger analysis for updates:`, error);
    }
  }

  private async queueUpdateForAnalysis(update: any): Promise<void> {
    try {
      console.log(`[AtlasXray] 🤖 Starting local language model analysis for update ${update.id}`);
      
      // Import the local language model analyzer
      const { analyzeUpdateQuality } = await import('../utils/localModelManager');
      
      // Get the update text for analysis
      const updateText = update.summary || update.details || 'No update text available';
      
      // Run local language model analysis
      const qualityResult = await analyzeUpdateQuality(updateText);
      
      // Store the analysis results in the database
      await db.projectUpdates.update(update.id, {
        analyzed: 1, // Use 1 instead of true for IndexedDB compatibility
        analysisDate: new Date().toISOString(),
        updateQuality: qualityResult.score,
        qualityLevel: qualityResult.quality,
        qualitySummary: qualityResult.summary,
        qualityRecommendations: JSON.stringify(qualityResult.recommendations),
        qualityMissingInfo: JSON.stringify(qualityResult.missingInfo)
      });
      
      console.log(`[AtlasXray] ✅ Local language model analysis complete for update ${update.id}: ${qualityResult.quality} quality (${qualityResult.score}/100)`);
      
    } catch (error) {
      console.error(`[AtlasXray] ❌ Failed to analyze update ${update.id}:`, error);
      
      // Fallback: mark as analyzed but with error
      try {
        await db.projectUpdates.update(update.id, {
          analyzed: 1, // Use 1 instead of true for IndexedDB compatibility
          analysisDate: new Date().toISOString(),
          updateQuality: 0,
          qualityLevel: 'poor',
          qualitySummary: 'Local language model analysis failed - fallback to basic analysis'
        });
      } catch (dbError) {
        console.error(`[AtlasXray] ❌ Failed to update database for update ${update.id}:`, dbError);
      }
    }
  }



  private updateState(updates: Partial<PipelineState>): void {
    this.state = { ...this.state, ...updates };
  }
}

// Export singleton instance
export const projectPipeline = new ProjectPipeline();

// Debug function - call this from console to test manually
(window as any).testAtlasXrayPipeline = async () => {
  console.log('[AtlasXray] 🧪 Manual pipeline test started');
  
  try {
    // Test DOM scanning
    console.log('[AtlasXray] 🧪 Testing DOM scanning...');
    const scanResult = await projectPipeline.scanProjectsOnPage();
    console.log('[AtlasXray] 🧪 DOM scan result:', scanResult);
    
    // Test pipeline state
    const state = projectPipeline.getState();
    console.log('[AtlasXray] 🧪 Pipeline state:', state);
    
    // Test Apollo client
    console.log('[AtlasXray] 🧪 Testing Apollo client...');
    try {
      const { apolloClient } = await import('./apolloClient');
      console.log('[AtlasXray] 🧪 Apollo client loaded:', !!apolloClient);
    } catch (error) {
      console.error('[AtlasXray] 🧪 Apollo client error:', error);
    }
    
    return { scanResult, state };
  } catch (error) {
    console.error('[AtlasXray] 🧪 Pipeline test failed:', error);
    return { error: String(error) };
  }
};
