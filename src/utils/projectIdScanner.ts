import { getItem, setItem, setProjectView, upsertProjectStatusHistory, upsertProjectUpdates, storeProjectImage, db } from "../utils/database";
import { apolloClient } from "../services/apolloClient";
import { gql } from "@apollo/client";
import { PROJECT_VIEW_QUERY } from "../graphql/projectViewQuery";
import { PROJECT_STATUS_HISTORY_QUERY } from "../graphql/projectStatusHistoryQuery";
import { PROJECT_UPDATES_QUERY } from "../graphql/projectUpdatesQuery";
import { setGlobalCloudAndSection } from "./globalState";
import { fetchImageFromBlobUrl } from "./imageUtils";
import type { AtlasXrayDB } from "../types/database";

// Chrome extension types
declare const chrome: any;

// Note: AI analysis will be handled by the popup/background context
// Content script will store updates for later analysis

// Regex for /o/{cloudId}/s/{sectionId}/project/{ORG-123}
const projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;

interface ProjectMatch {
  projectId: string;
  cloudId: string;
  sectionId: string;
}

interface ProjectViewVariables {
  key: string;
  trackViewEvent: string;
  workspaceId: string | null;
  onboardingKeyFilter: string;
  areMilestonesEnabled: boolean;
  cloudId: string;
  isNavRefreshEnabled: boolean;
}

export function findMatchingProjectLinksFromHrefs(hrefs: (string | null)[]): ProjectMatch[] {
  const seen = new Set<string>();
  const results: ProjectMatch[] = [];
  
  hrefs.forEach(href => {
    if (!href) return;
    const match = href.match(projectLinkPattern);
    if (match && match[3]) {
      const cloudId = match[1];
      const sectionId = match[2]; // Extract sectionId
      const projectId = match[3];
      const key = `${cloudId}:${projectId}`;
      if (!seen.has(key)) {
        seen.add(key);
        // Set global state for cloudId and sectionId
        setGlobalCloudAndSection({ newCloudId: cloudId, newSectionId: sectionId });
        results.push({ projectId, cloudId, sectionId }); // Return sectionId too
      }
    }
  });
  return results;
}

/**
 * Process ProseMirror content to find and store images
 */
async function processAndStoreImages(projectKey: string, content: any): Promise<void> {
  if (!content || !Array.isArray(content)) return;
  
  for (const node of content) {
    if (node.type === 'media' && node.attrs?.id) {
      const mediaId = node.attrs.id;
      
      // Check if we already have this image
      const existing = await getItem(`image:${projectKey}:${mediaId}`);
      if (existing) continue;
      
      // Try to find the actual image URL in the DOM
      const imageElement = document.querySelector(`[data-media-id="${mediaId}"], [data-attachment-id="${mediaId}"]`);
      if (imageElement) {
        const imgSrc = imageElement.getAttribute('src');
        if (imgSrc && imgSrc.startsWith('blob:')) {
          try {
            const imageData = await fetchImageFromBlobUrl(imgSrc);
            if (imageData) {
              await storeProjectImage(projectKey, mediaId, imageData.imageData, imageData.mimeType);
              await setItem(`image:${projectKey}:${mediaId}`, 'stored');
              console.log(`[AtlasXray] Stored image for ${projectKey}:${mediaId}`);
            }
          } catch (error) {
            console.warn(`[AtlasXray] Failed to store image ${mediaId}:`, error);
          }
        }
      }
    }
    
    // Recursively process nested content
    if (node.content) {
      await processAndStoreImages(projectKey, node.content);
    }
  }
}

async function fetchAndStoreProjectData(projectId: string, cloudId: string): Promise<void> {
  const variables: ProjectViewVariables = {
    key: projectId,
    trackViewEvent: "DIRECT",
    workspaceId: null,
    onboardingKeyFilter: "PROJECT_SPOTLIGHT",
    areMilestonesEnabled: false,
    cloudId: cloudId || "",
    isNavRefreshEnabled: true
  };
  
  // ProjectView
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_VIEW_QUERY}`,
      variables
    });
    await setProjectView(projectId, data);
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project view data for projectId: ${projectId}`, err);
  }

  // ProjectStatusHistory (normalize and store one row per status change)
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_STATUS_HISTORY_QUERY}`,
      variables: { projectKey: projectId }
    });
    // Normalize: extract all .node from edges
    if (!projectId) {
      console.error('[AtlasXray] projectId is undefined when saving status history!');
      return;
    }
    const nodes = data?.project?.updates?.edges?.map((edge: any) => edge.node).filter(Boolean) || [];
    if (nodes.length > 0) {
      await upsertProjectStatusHistory(nodes, projectId);
    }
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch project status history for projectId: ${projectId}`, err);
  }

  // ProjectUpdates (normalize and store flat rows)
  try {
    const { data } = await apolloClient.query({
      query: gql`${PROJECT_UPDATES_QUERY}`,
      variables: { key: projectId, isUpdatesTab: true }
    });
    // Normalize: extract all .node from edges
    const nodes = data?.project?.updates?.edges?.map((edge: any) => edge.node).filter(Boolean) || [];
    if (nodes.length > 0) {
      await upsertProjectUpdates(nodes);
      
      // Process and store images from the updates
      for (const node of nodes) {
        if (node.summary) {
          try {
            const summaryContent = JSON.parse(node.summary);
            await processAndStoreImages(projectId, summaryContent.content);
          } catch (error) {
            // Summary might not be valid JSON, skip image processing
          }
        }
      }
      
                          // Trigger background analysis for new updates
                    console.log(`[AtlasXray] 🔍 Found ${nodes.length} updates for project ${projectId}, triggering background analysis...`);
                    await triggerBackgroundAnalysis(nodes, projectId);
                    
                    // Update project counts in storage for the floating button
                    try {
                        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                            const allProjects = await (db as AtlasXrayDB).projectView.toArray();
                            const visibleProjects = await downloadProjectData();
                            await chrome.storage.local.set({
                                projectCount: allProjects.length,
                                visibleProjectCount: visibleProjects.length
                            });
                        }
                    } catch (error) {
                        console.log('[AtlasXray] Could not update project counts:', error);
                    }
    }
  } catch (err) {
    console.error(`[AtlasXray] Failed to fetch [ProjectUpdatesQuery] for projectId: ${projectId}`, err);
  }
}





/**
 * Trigger background analysis for new project updates
 */
async function triggerBackgroundAnalysis(updates: any[], projectId: string): Promise<void> {
  console.log(`[AtlasXray] 🚀 Starting background analysis for ${updates.length} updates in project ${projectId}`);
  
  for (const update of updates) {
    try {
      // Skip if no summary content
      if (!update.summary) continue;
      
      // Parse the summary content
      let updateText = '';
      try {
        const summaryContent = JSON.parse(update.summary);
        updateText = extractTextFromProseMirror(summaryContent.content);
      } catch (error) {
        // If summary isn't valid JSON, try to use it as plain text
        updateText = update.summary;
      }
      
      if (!updateText.trim()) continue;
      
      // Determine update type and state for analysis
      const updateType = determineUpdateType(updateText);
      const state = update.state || 'no-status';
      
      // Send message to background script for analysis
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        console.log(`[AtlasXray] 📤 Sending analysis request to background script for update ${update.id}`);
        chrome.runtime.sendMessage({
          type: 'ANALYZE_UPDATE_QUALITY',
          updateId: update.id,
          updateText,
          updateType,
          state
        }, (response: any) => {
          if (response?.success) {
            console.log(`[AtlasXray] ✅ Background analysis triggered for update ${update.id}`);
          } else {
            console.warn(`[AtlasXray] ❌ Failed to trigger background analysis for update ${update.id}:`, response?.error);
          }
        });
      } else {
        console.warn(`[AtlasXray] ⚠️ Chrome runtime not available for update ${update.id}`);
      }
      
    } catch (error) {
      console.warn(`[AtlasXray] Failed to prepare update ${update.id} for background analysis:`, error);
    }
  }
}

/**
 * Extract plain text from ProseMirror content
 */
function extractTextFromProseMirror(content: any[]): string {
  if (!Array.isArray(content)) return '';
  
  let text = '';
  for (const node of content) {
    if (node.type === 'text' && node.text) {
      text += node.text + ' ';
    } else if (node.content) {
      text += extractTextFromProseMirror(node.content);
    }
  }
  return text.trim();
}

/**
 * Determine the type of update based on content
 */
function determineUpdateType(updateText: string): string {
  const text = updateText.toLowerCase();
  
  if (text.includes('paused') || text.includes('pause')) return 'paused';
  if (text.includes('off-track') || text.includes('off track')) return 'off-track';
  if (text.includes('at-risk') || text.includes('at risk')) return 'at-risk';
  if (text.includes('completed') || text.includes('complete')) return 'completed';
  if (text.includes('cancelled') || text.includes('cancel')) return 'cancelled';
  if (text.includes('new initiative') || text.includes('prioritised')) return 'prioritization';
  
  return 'general';
}

export async function downloadProjectData(): Promise<ProjectMatch[]> {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const hrefs = links.map(link => link.getAttribute('href'));
  const matches = findMatchingProjectLinksFromHrefs(hrefs);
  
  // Only fetch data for new projects we haven't seen before
  const newProjects = [];
  for (const { projectId, cloudId } of matches) {
    const key = `projectId:${projectId}`;
    const existing = await getItem(key);
    if (!existing) {
      newProjects.push({ projectId, cloudId });
    }
  }
  
  // Batch fetch data for new projects (limit to 5 at a time to avoid overwhelming the API)
  const batchSize = 5;
  for (let i = 0; i < newProjects.length; i += batchSize) {
    const batch = newProjects.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async ({ projectId, cloudId }) => {
        const key = `projectId:${projectId}`;
        await setItem(key, projectId);
        await fetchAndStoreProjectData(projectId, cloudId);
      })
    );
    
    // Add a small delay between batches to be respectful to the API
    if (i + batchSize < newProjects.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return matches;
}
