# 🏗️ ATLAS XRAY ARCHITECTURE PRINCIPLES & RULES

*This document serves as our architectural constitution - all changes must adhere to these principles*

## 🎯 **CORE PRINCIPLES**

### **1.0 AI ANALYSIS IS MANDATORY** 🔥 **CRITICAL RULE**
- **NEVER revert to rule-based analysis** - AI analysis must be the primary method
- **AI analysis is the core value proposition** - NO FALLBACKS to rule-based analysis
- **If AI analysis fails, get NO RESULT** - do not degrade to inferior rule-based analysis
- **Rule-based analysis is completely forbidden** - it produces poor quality results and is never acceptable
- **This rule is non-negotiable** - any attempt to bypass AI analysis will be reverted
- **AI or nothing** - quality over quantity

### **1.1 Single Source of Truth**
- **Database**: IndexedDB via Dexie is the single source of truth for all data
- **State**: React state should be derived from database queries, not duplicated
- **Services**: Each domain has exactly one service responsible for it

### **1.2 Reactive Data Flow**
- **Always use `useLiveQuery`** for database-driven UI updates
- **Never store derived state** in React state when it can come from database
- **Database changes automatically update UI** through Dexie's reactive system

### **1.3 Separation of Concerns**
- **Services**: Handle business logic and external API calls
- **Components**: Handle UI rendering and user interactions
- **Database**: Handle data persistence and queries
- **Utils**: Handle pure functions and calculations

### **1.4 Performance First**
- **Lazy loading** for heavy operations (AI models, large datasets)
- **Debounced updates** for frequent operations (URL changes, typing)
- **Efficient queries** with proper indexes and minimal data transfer

## 🗄️ **DATABASE ARCHITECTURE** - **KEEP IT SIMPLE**

### **2.0 CORE RULE: ONE TABLE PER ENTITY**
- **NO DUPLICATE DATA STORAGE** - Analysis results go DIRECTLY in ProjectUpdate
- **NO SEPARATE ANALYSIS TABLES** - analysisCache and storedAnalyses are FORBIDDEN
- **NO COMPLEX JOINS** - Keep queries simple and fast
- **NO CACHING LAYERS** - Database IS the cache

### **2.1 Database Schema - SIMPLIFIED**

```typescript
// ONLY THESE TABLES - NO MORE, NO LESS
interface ProjectView {
  projectKey: string;        // Primary key - project identifier
  name?: string;             // Project name
  status?: string;           // Current project status
  team?: string;             // Team name
  owner?: string;            // Owner display name
  lastUpdated?: string;      // ISO date string
  archived: boolean;         // Whether project is archived
  createdAt?: string;        // ISO date string
}

interface ProjectUpdate {
  uuid: string;              // Primary key - unique update identifier
  projectKey: string;        // Foreign key to ProjectView
  creationDate: string;      // ISO date string
  state?: string;            // New state after update
  missedUpdate: boolean;     // Whether this update was missed
  targetDate?: string;       // Target date information
  newDueDate?: string;       // New due date label
  oldDueDate?: string;       // Previous due date label
  oldState?: string;         // Previous state
  summary?: string;          // Update summary text
  details?: string;          // Additional details (JSON string)
  
  // AI Analysis results - ALL STORED HERE, NO SEPARATE TABLES
  updateQuality?: number;    // Quality score 0-100 FROM LOCAL AI MODEL ONLY
  qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor'; // FROM AI ONLY
  qualitySummary?: string;   // AI-generated quality summary
  qualityMissingInfo?: string[]; // What AI detected as missing
  qualityRecommendations?: string[]; // AI recommendations for improvement
  analyzed?: boolean;        // Whether AI analysis is complete
  analysisDate?: string;     // When AI analysis was performed
}

interface MetaData {
  key: string;               // Primary key - metadata identifier
  value: string;             // Metadata value (JSON string for complex data)
  lastUpdated: string;       // ISO date string
}
// 🚫 FORBIDDEN TABLES - THESE VIOLATE SIMPLICITY RULES
// ❌ analysisCache - NO CACHING TABLES, DATABASE IS THE CACHE
// ❌ storedAnalyses - NO SEPARATE ANALYSIS TABLES, USE ProjectUpdate FIELDS
// ❌ qualityScores - NO DUPLICATE DATA STORAGE
// ❌ sentimentAnalysis - NO COMPLEX ANALYSIS TABLES
```

### **2.2 Database Rules - KEEP IT SIMPLE**

#### **2.2.0 FORBIDDEN PATTERNS**
- **NO SEPARATE ANALYSIS TABLES** - All analysis data goes in ProjectUpdate
- **NO CACHING TABLES** - Database is the cache, no analysisCache table
- **NO DUPLICATE STORAGE** - One piece of data, one location
- **NO COMPLEX JOINS** - Simple queries only

#### **2.2.1 Table Design**
- **No nested objects** - flatten data structures for efficient querying
- **Use string IDs** - avoid numeric auto-increment for cross-context compatibility
- **ISO date strings** - consistent date format across all tables
- **JSON strings for complex data** - store structured data as serialized strings

#### **2.2.2 Indexing Strategy**
```typescript
// Primary indexes
projectViews: 'projectKey'                    // Fast project lookups
projectUpdates: 'uuid, projectKey, creationDate, updateQuality'  // Fast update queries
meta: 'key'                                  // Fast metadata access

// Secondary considerations
// - projectKey + creationDate for timeline queries
// - updateQuality for quality-based filtering
// - creationDate for date-range queries
```

#### **2.2.3 Data Integrity**
- **Foreign key relationships** - projectKey in updates must exist in projectViews
- **Cascade updates** - when project is deleted, all updates are deleted
- **Data validation** - validate data before storing, reject invalid data
- **Type safety** - use TypeScript interfaces for all database operations

### **2.3 Database Access Patterns**

#### **2.3.1 Direct Database Access**
```typescript
// ✅ CORRECT: Direct database access for simple operations
const projectCount = await db.projectViews.count();
const project = await db.projectViews.get(projectKey);

// ❌ WRONG: Wrapping simple operations in services
const projectCount = await projectService.getCount(); // Unnecessary abstraction
```

#### **2.3.2 Service Layer for Complex Operations**
```typescript
// ✅ CORRECT: Service for complex business logic
const updates = await updateService.fetchAndAnalyzeUpdates(projectKey);

// ✅ CORRECT: Service for external API calls
const projects = await projectService.fetchFromServer(tql);
```

#### **2.3.3 Repository Pattern (Future Consideration)**
```typescript
// Future: Consider repository pattern for complex queries
class ProjectRepository {
  async getProjectsWithUpdates(limit: number): Promise<ProjectWithUpdates[]> {
    // Complex join queries
  }
}
```

## 🔄 **DATA FLOW PATTERNS**

### **3.1 Data Flow Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   Service       │    │   Database      │
│   APIs         │───▶│   Layer         │───▶│   (IndexedDB)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   React         │    │   UI            │
                       │   Components    │◀───│   (useLiveQuery)│
                       └─────────────────┘    └─────────────────┘
```

### **3.2 Data Flow Rules**

#### **3.2.1 Unidirectional Flow**
- **Data flows down** from database to components
- **Actions flow up** from components to services to database
- **No circular dependencies** between layers

#### **3.2.2 Update Triggers**
```typescript
// ✅ CORRECT: Database change triggers UI update
const projects = useLiveQuery(() => db.projectViews.toArray());

// ❌ WRONG: Manual state management
const [projects, setProjects] = useState([]);
useEffect(() => {
  db.projectViews.toArray().then(setProjects);
}, []);
```

#### **3.2.3 Data Synchronization**
- **Server data** → Service → Database → UI (via useLiveQuery)
- **User actions** → Component → Service → Database → UI (via useLiveQuery)
- **Background updates** → Service → Database → UI (via useLiveQuery)

### **3.3 Real-time Updates**

#### **3.3.1 Live Query Usage**
```typescript
// ✅ CORRECT: Live queries for reactive data
const projectCount = useLiveQuery(() => db.projectViews.count());
const updates = useLiveQuery(() => db.projectUpdates.toArray());
const analyzedCount = useLiveQuery(() => 
  db.projectUpdates.where('updateQuality').above(0).count()
);

// ❌ WRONG: Manual state management
const [count, setCount] = useState(0);
useEffect(() => {
  db.projectViews.count().then(setCount);
}, []);
```

#### **3.3.2 When to Use Live Queries**
- **Always use** for database-driven UI
- **Use for** counts, lists, filtered data
- **Use for** any data that should update when database changes

#### **3.3.3 When NOT to Use Live Queries**
- **Don't use** for computed values that don't change
- **Don't use** for external API data (use regular state)
- **Don't use** for temporary UI state (use regular state)

## 🎛️ **STATE MANAGEMENT**

### **4.1 State Hierarchy**

```
┌─────────────────────────────────────────────────────────────┐
│                    Application State                        │
├─────────────────────────────────────────────────────────────┤
│  Database State (IndexedDB)                                │
│  ├── Projects, Updates, Metadata                           │
│  └── Managed by Dexie + useLiveQuery                      │
├─────────────────────────────────────────────────────────────┤
│  UI State (React useState)                                 │
│  ├── Modal open/close                                      │
│  ├── Form inputs                                           │
│  ├── Loading states                                        │
│  └── Temporary UI state                                    │
├─────────────────────────────────────────────────────────────┤
│  External State (External APIs)                            │
│  ├── Server data                                           │
│  ├── User preferences                                      │
│  └── Browser state                                         │
└─────────────────────────────────────────────────────────────┘
```

### **4.2 State Rules**

#### **4.2.1 Database State**
- **Primary state** - all persistent data lives here
- **Reactive updates** - UI automatically updates when database changes
- **Single source of truth** - no duplicate state in React

#### **4.2.2 UI State**
- **Temporary only** - modal states, form inputs, loading states
- **Derived from database** - counts, lists, filtered data
- **User interactions** - selections, form data, navigation state

#### **4.2.3 External State**
- **Cached in database** - server data stored locally
- **Refreshed on demand** - user actions trigger server updates
- **Background sync** - periodic updates for fresh data

### **4.3 State Update Patterns**

#### **4.3.1 Database Updates**
```typescript
// ✅ CORRECT: Update database, UI updates automatically
await db.projectViews.put(project);
// UI automatically updates via useLiveQuery

// ❌ WRONG: Update both database and state
await db.projectViews.put(project);
setProjects([...projects, project]); // Duplicate update
```

#### **4.3.2 UI Updates**
```typescript
// ✅ CORRECT: Update UI state only
const [isModalOpen, setIsModalOpen] = useState(false);
setIsModalOpen(true);

// ❌ WRONG: Store UI state in database
await db.meta.put({ key: 'modalOpen', value: 'true' });
```

## 🏭 **SERVICE ARCHITECTURE**

### **5.1 Service Responsibilities**

#### **5.1.1 Project Service**
```typescript
class ProjectService {
  // ✅ CORRECT: Clear, single responsibility
  async fetchProjectsFromServer(tql: string): Promise<string[]>
  async storeProjects(projects: ProjectView[]): Promise<void>
  async getProjectByKey(key: string): Promise<ProjectView | undefined>
  
  // ❌ WRONG: Multiple responsibilities
  async doEverything(): Promise<void> // Too broad
}
```

#### **5.1.2 Update Service**
```typescript
class UpdateService {
  // ✅ CORRECT: Update-focused operations
  async fetchUpdatesForProject(projectKey: string): Promise<void>
  async analyzeUpdate(update: ProjectUpdate): Promise<void>
  async getUpdateCount(projectKey: string): Promise<number>
}
```

#### **5.1.3 Analysis Service**
```typescript
class AnalysisService {
  // ✅ CORRECT: Analysis-focused operations
  async analyzeQuality(text: string): Promise<QualityResult>
  async getAnalysisHistory(projectKey: string): Promise<Analysis[]>
  async exportAnalysis(projectKey: string): Promise<ExportData>
}
```

### **5.2 Service Patterns**

#### **5.2.1 Singleton Pattern**
```typescript
// ✅ CORRECT: Singleton for services
export class ProjectService {
  private static instance: ProjectService;
  
  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }
}

export const projectService = ProjectService.getInstance();
```

#### **5.2.2 Service Composition**
```typescript
// ✅ CORRECT: Services can use other services
class ProjectService {
  constructor(
    private updateService: UpdateService,
    private analysisService: AnalysisService
  ) {}
  
  async processProject(projectKey: string): Promise<void> {
    // Use other services for their responsibilities
    await this.updateService.fetchUpdatesForProject(projectKey);
    // ... other operations
  }
}
```

#### **5.2.3 Service Lifecycle**
```typescript
// ✅ CORRECT: Services are long-lived singletons
// Initialize once, use throughout application lifecycle
// Clean up resources when needed
class ProjectService {
  private cleanup(): void {
    // Clean up resources, clear caches, etc.
  }
}
```

### **5.3 AI Analysis Rules** 🔥 **CRITICAL**

#### **5.3.1 AI Analysis is Mandatory**
- **NEVER use rule-based analysis** - it produces inferior results and is completely forbidden
- **AI analysis must be attempted first** in all analysis strategies
- **NO FALLBACKS to rule-based** - if AI fails, get no result
- **If AI analysis breaks, fix the AI, don't work around it**
- **Quality over quantity** - better no analysis than bad analysis

### **5.4 ProseMirror Rendering Rules** 🔥 **CRITICAL**

#### **5.4.1 ProseMirror Rendering is Mandatory**
- **NEVER remove ProseMirror rendering** - it's critical for displaying Atlassian content
- **ProseMirror content must be rendered as HTML** - Atlassian APIs return JSON that needs conversion
- **Support all Atlassian node types** - paragraphs, lists, headings, media, status, dates, etc.
- **Handle media content properly** - images, files, and inline cards must render correctly
- **Maintain styling consistency** - use Atlassian design system colors and spacing

### **5.6 Project Discovery Rules** 🔥 **CRITICAL**

#### **5.6.1 NO Page Scanning for Project Keys**
- **NEVER scan DOM pages for project IDs/keys** - this violates privacy and is unreliable
- **ALWAYS use simpleProjectListFetcher service** for project discovery
- **Project keys must come from GraphQL APIs** - not from DOM content scraping
- **DOM scanning is forbidden** - use proper Atlassian APIs for project data
- **This rule is non-negotiable** - any attempt to scan pages will be reverted

#### **5.6.2 Project Discovery Service Requirements**
```typescript
// ✅ CORRECT: Use simpleProjectListFetcher service
const visibleProjectKeys = await simpleProjectListFetcher.getVisibleProjects();

// ❌ FORBIDDEN: DOM scanning for project keys
const getVisibleProjectKeysFromPage = async (): Promise<string[]> => {
  // This is completely forbidden - never scan DOM for project data
  const textElements = document.querySelectorAll('*');
  // ... DOM scanning logic
};
```

#### **5.6.3 Project Discovery Patterns**
```typescript
// ✅ CORRECT: Service-based project discovery
class ProjectDiscoveryService {
  async getVisibleProjects(): Promise<string[]> {
    // Use GraphQL APIs, not DOM scanning
    const projects = await this.fetchProjectsFromAPI();
    return projects.map(p => p.key);
  }
}

// ❌ WRONG: DOM-based project discovery
const scanPageForProjects = () => {
  // Never scan DOM for project data
  return document.querySelectorAll('[data-project-key]');
};
```

#### **5.4.2 ProseMirror Service Requirements**
```typescript
// ✅ CORRECT: ProseMirror service with full Atlassian support
class ProseMirrorService {
  // Must support all Atlassian content types
  renderProseMirror(content: string | any): string
  
  // Must handle media nodes for proper display
  private renderMediaNode(node: ProseMirrorNode): string
  
  // Must support status and date nodes
  private renderStatusNode(node: ProseMirrorNode): string
  private renderDateNode(node: ProseMirrorNode): string
}

// ❌ WRONG: Simple text extraction
const simpleRenderer = (content: string) => content; // Loses formatting and media
```

#### **5.4.3 Content Rendering Patterns**
```typescript
// ✅ CORRECT: Full ProseMirror rendering
<div dangerouslySetInnerHTML={{ 
  __html: renderProseMirror(update.summary) 
}} />

// ❌ WRONG: Direct text display
<div>{update.summary}</div> // Shows raw JSON, not formatted content
```

### **5.5 Version Checking Rules** 🔥 **CRITICAL**

#### **5.5.1 Version Checking is Mandatory**
- **NEVER remove version checking** - it's critical for extension updates and user experience
- **Version checking must use GitHub API** - compare current version with latest release
- **Rate limiting must be implemented** - avoid hitting GitHub API limits
- **Notifications must work properly** - users need to know about updates
- **Local dev builds must be detected** - skip checks for development versions

#### **5.5.2 Version Service Requirements**
```typescript
// ✅ CORRECT: Full version checking service
class VersionService {
  // Must check GitHub releases
  async checkForUpdates(): Promise<VersionInfo>
  
  // Must implement rate limiting
  private async getLastCheckTime(): Promise<number>
  private async setLastCheckTime(timestamp: number): Promise<void>
  
  // Must show proper notifications
  async showUpdateNotification(version: string, releaseUrl: string): Promise<void>
  
  // Must handle local dev builds
  isLocalDevVersion(): boolean
}

// ❌ WRONG: Simplified version checking
const simpleVersionCheck = () => ({ hasUpdate: false }); // No actual checking
```

#### **5.5.3 Version Checking Patterns**
```typescript
// ✅ CORRECT: Full version checking workflow
const updateInfo = await versionService.checkForUpdates();
if (updateInfo.hasUpdate) {
  await versionService.showUpdateNotification(
    updateInfo.latestVersion!, 
    updateInfo.releaseUrl!
  );
}

// ❌ WRONG: No version checking
// Missing version checking - users won't know about updates
```

#### **5.3.2 Analysis Strategy Priority**
```typescript
// ✅ CORRECT: AI-only strategy
async performAutoAnalysis(text: string): Promise<ProjectUpdateAnalysis> {
  // 1. Try AI analysis first
  if (await this.isAIAvailable()) {
    try {
      return await this.performAIAnalysis(text);
    } catch (error) {
      console.log('[AnalysisService] AI failed, no fallback - analysis incomplete');
      throw new Error('AI analysis failed and no fallback is allowed');
    }
  }
  
  // 2. No AI available - no analysis possible
  throw new Error('AI analysis not available in this context');
}

// ❌ WRONG: Rule-based first
async performAutoAnalysis(text: string): Promise<ProjectUpdateAnalysis> {
  // This is forbidden - rule-based should never be primary
  return await this.performRuleBasedAnalysis(text);
}

#### **5.3.4 Complete Removal of Rule-Based Analysis**
```typescript
// ✅ CORRECT: No rule-based strategy available
export interface AnalysisConfig {
  strategy: 'ai' | 'hybrid' | 'auto';  // rule-based removed
  // ... other config
}

// ✅ CORRECT: No rule-based in available strategies
async getAvailableStrategies(): Promise<string[]> {
  const strategies: string[] = [];
  
  if (await this.isAIAvailable()) {
    strategies.push('ai', 'hybrid', 'auto');
  }
  
  return strategies;
}
```

#### **5.3.3 AI Availability Check**
```typescript
// ✅ CORRECT: Proper AI availability check
async isAIAvailable(): Promise<boolean> {
  return await loadAILibraries();
}

// ❌ WRONG: Direct pipeline check
if (pipeline && !isContentScript) {
  // This bypasses proper AI loading and can fail
}
```

#### **5.3.5 SIMPLIFIED AI ANALYSIS FLOW** 🔥 **MANDATORY**
```typescript
// ✅ CORRECT: Simple AI analysis storage
async analyzeUpdate(updateText: string, updateUuid: string): Promise<void> {
  // 1. Run AI analysis
  const qualityResult = await analyzeUpdateQuality(updateText);
  
  // 2. Store DIRECTLY in ProjectUpdate table - NO SEPARATE TABLES
  await db.projectUpdates.update(updateUuid, {
    updateQuality: qualityResult.overallScore,
    qualityLevel: qualityResult.qualityLevel,
    qualitySummary: qualityResult.summary,
    qualityMissingInfo: qualityResult.missingInfo,
    qualityRecommendations: qualityResult.recommendations,
    analyzed: true,
    analysisDate: new Date().toISOString()
  });
}

// ❌ FORBIDDEN: Separate analysis tables
await storedAnalyses.add(analysis);     // NEVER DO THIS
await analysisCache.put(cached);        // NEVER DO THIS
await qualityScores.insert(scores);     // NEVER DO THIS
```

#### **5.3.6 FORBIDDEN ANALYSIS PATTERNS** ❌
- **NO separate analysis tables**: analysisCache, storedAnalyses, qualityScores
- **NO rule-based analysis**: All rule-based methods are forbidden
- **NO complex caching**: Database IS the cache
- **NO fallback strategies**: AI or nothing

#### **5.3.7 EXTENSION CONTEXT SEPARATION** 🔥 **CRITICAL**
```typescript
// ✅ CORRECT: Content Script (web pages)
// - Runs on: https://home.atlassian.com, https://github.com, etc.
// - CANNOT: Load @xenova/transformers (dynamic import blocked)
// - CAN: Store ProjectUpdate records, read database
// - MUST: Defer AI analysis to background script

// ✅ CORRECT: Background Script (extension context)
// - Runs on: chrome-extension://[id] (extension service worker)
// - CAN: Load @xenova/transformers, run AI models
// - CAN: Access IndexedDB, process deferred analysis
// - MUST: Handle all AI analysis requests

// ❌ WRONG: Attempting AI in content script
if (isContentScript) {
  // NEVER try to load AI libraries here
  // NEVER try to run analysis here
  // ALWAYS defer to background script
}
```

#### **5.3.8 CONTENT SCRIPT DETECTION RULES**
```typescript
// ✅ CORRECT: Simple content script detection
const isContentScript = typeof window !== 'undefined' && (
  (window.location.href.includes('http://') || 
   window.location.href.includes('https://')) && 
  !window.location.href.includes('chrome-extension://') && 
  !window.location.href.includes('moz-extension://')
);

// ❌ WRONG: Complex detection that can fail
const isContentScript = window.location.href.includes('chrome-extension://') || 
  window.location.href.includes('moz-extension://') ||
  window.location.href.includes('chrome://') ||
  window.location.href.includes('about:');
```

#### **5.3.9 CROSS-CONTEXT DATA FLOW** 🔄
```typescript
// 1. CONTENT SCRIPT: Store update with analyzed: false
await db.storeProjectUpdate({
  uuid: 'update-123',
  projectKey: 'PROJ-123',
  summary: 'Update text here...',
  analyzed: false  // ← Mark for background processing
});

// 2. BACKGROUND SCRIPT: Find and process unanalyzed updates
const unanalyzed = await db.getUnanalyzedUpdates();
for (const update of unanalyzed) {
  const qualityResult = await analyzeUpdateQuality(update.summary);
  await db.updateProjectUpdateQuality(update.uuid, qualityResult);
}

// 3. UI: Read quality data from ProjectUpdate table
const updates = useLiveQuery(() => 
  db.projectUpdates.where('analyzed').equals(true).toArray()
);
// UI automatically updates when background script completes analysis
```

#### **5.3.10 BACKGROUND SCRIPT INITIALIZATION** 🚀
```typescript
// ✅ CORRECT: Background script startup
// src/background/background.js
import './projectUpdateWatcher.js';  // Import watcher for AI analysis

// src/background/projectUpdateWatcher.js
initializeWatcher();  // Start watching for unanalyzed updates

// ❌ WRONG: Forgetting to import watcher
// This will cause AI analysis to never run
```

## 🧩 **COMPONENT PATTERNS**

### **6.1 Component Data Flow**

#### **6.1.1 Data Fetching**
```typescript
// ✅ CORRECT: Components use live queries for data
function ProjectList() {
  const projects = useLiveQuery(() => db.projectViews.toArray());
  
  if (!projects) return <div>Loading...</div>;
  
  return (
    <div>
      {projects.map(project => (
        <ProjectItem key={project.projectKey} project={project} />
      ))}
    </div>
  );
}
```

#### **6.1.2 User Actions**
```typescript
// ✅ CORRECT: Actions go through services to database
function ProjectItem({ project }: { project: ProjectView }) {
  const handleRefresh = async () => {
    await projectService.refreshProject(project.projectKey);
    // UI updates automatically via useLiveQuery
  };
  
  return (
    <div>
      <span>{project.name}</span>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
}
```

### **6.2 Component Rules**

#### **6.2.1 Data Access**
- **Always use useLiveQuery** for database data
- **Never store database data** in component state
- **Derive computed values** from live query results

#### **6.2.2 State Management**
- **Minimal local state** - only UI-specific state
- **No business logic** - delegate to services
- **No data caching** - let database handle caching

#### **6.2.3 Performance**
- **Memoize expensive computations** with useMemo
- **Avoid unnecessary re-renders** with proper dependencies
- **Lazy load** heavy components and data

## 📊 **PERFORMANCE & MONITORING**

### **7.1 Performance Principles**

#### **7.1.1 Database Performance**
- **Efficient queries** - use indexes, avoid full table scans
- **Batch operations** - group multiple operations together
- **Lazy loading** - load data only when needed

#### **7.1.2 UI Performance**
- **Virtual scrolling** for large lists
- **Debounced updates** for frequent changes
- **Memoized components** for expensive renders

#### **7.1.3 Memory Management**
- **Clean up resources** - dispose of models, clear caches
- **Monitor memory usage** - prevent memory leaks
- **Efficient caching** - limit cache size, clear old entries

#### **8.1.3 Service Error Handling**
```typescript
// ✅ CORRECT: Services handle their own errors
class ProjectService {
  async fetchProjects(): Promise<ProjectView[]> {
    try {
      const projects = await this.apiCall();
      return projects;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
}
```

### **8.2 Error Recovery**

#### **8.2.1 Automatic Recovery**
- **Retry failed operations** with exponential backoff
- **Fallback to cached data** when fresh data unavailable
- **Background refresh** to restore data when possible

#### **8.2.3 Rate Limiting & 429 Prevention**
- **Exponential backoff** for all GraphQL API calls
- **Retry logic** with increasing delays for rate limit errors
- **Rate limit header detection** (`X-RateLimit-Remaining`, `Retry-After`)
- **Consistent application** across all services making API calls
- **Adaptive delays** based on server response patterns

### **8.3 GraphQL Rate Limiting Patterns**

#### **8.3.1 Exponential Backoff Implementation**
```typescript
// ✅ CORRECT: Consistent rate limiting across all GraphQL calls
class RateLimitManager {
  private retryCount = 0;
  private baseDelay = 1000; // 1 second base delay
  
  async executeWithBackoff<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.isRateLimitError(error) && this.retryCount < maxRetries) {
        const delay = this.baseDelay * Math.pow(2, this.retryCount);
        this.retryCount++;
        console.log(`[RateLimit] Retry ${this.retryCount}/${maxRetries} after ${delay}ms delay`);
        await this.delay(delay);
        return this.executeWithBackoff(operation, maxRetries);
      }
      throw error;
    }
  }
  
  private isRateLimitError(error: any): boolean {
    return error?.message?.includes('429') || 
           error?.graphQLErrors?.some((e: any) => e.extensions?.code === 'RATE_LIMIT_EXCEEDED');
  }
}
```

#### **8.3.2 Rate Limit Header Detection**
```typescript
// ✅ CORRECT: Detect and respect server rate limits
const response = await apolloClient.query({...});
const remainingRequests = response.headers?.['x-ratelimit-remaining'];
const retryAfter = response.headers?.['retry-after'];

if (remainingRequests && parseInt(remainingRequests) < 10) {
  console.log(`[RateLimit] Only ${remainingRequests} requests remaining, slowing down`);
  await this.delay(2000);
}

if (retryAfter) {
  console.log(`[RateLimit] Server requests ${retryAfter}s delay`);
  await this.delay(parseInt(retryAfter) * 1000);
}
```

#### **8.3.3 Service Integration Pattern**
```typescript
// ✅ CORRECT: All services use the same rate limiting approach
export class ProjectService {
  private rateLimiter = new RateLimitManager();
  
  async fetchProjects(): Promise<Project[]> {
    return this.rateLimiter.executeWithBackoff(async () => {
      const { data } = await apolloClient.query({
        query: PROJECTS_QUERY,
        fetchPolicy: 'cache-first'
      });
      return data.projects;
    });
  }
}
```

#### **8.2.2 User Recovery**
- **Clear error messages** explaining what went wrong
- **Recovery actions** - retry, refresh, manual intervention
- **Progress indicators** for long-running operations

## 🤖 **AI ANALYSIS ARCHITECTURE**

### **9.1 AI Analysis Principles**

#### **9.1.1 AI-Only Mandate**
- **NO FALLBACKS ALLOWED** - AI analysis or no result
- **No rule-based analysis** - all quality assessment must use AI models
- **Pure AI approach** - maintain the working AI implementation pattern

#### **9.1.2 Chrome Extension AI Constraints**
- **Content script limitations** - AI models cannot load in content scripts due to CSP/WebAssembly restrictions
- **Background script delegation** - content scripts delegate AI analysis to background service worker
- **Model loading strategy** - AI models loaded only in background script context

#### **9.1.3 AI Model Architecture**
```typescript
// ✅ CORRECT: AI models loaded in background script only
let qaModel: any = null;
let sentimentModel: any = null;
let summarizer: any = null;

async function initializeModels() {
  if (!qaModel) {
    qaModel = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
  }
  if (!sentimentModel) {
    sentimentModel = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
  }
  if (!summarizer) {
    summarizer = await pipeline('summarization', 'Xenova/sshleifer-tiny-cnn');
  }
}
```

### **9.2 AI Analysis Flow**

#### **9.2.1 Content Script Detection**
```typescript
// ✅ CORRECT: Detect content script context for proper delegation
const isContentScript = typeof window !== 'undefined' && 
  (window.location.href.includes('chrome-extension://') || 
   window.location.href.includes('moz-extension://') ||
   window.location.href.includes('chrome://') ||
   window.location.href.includes('about:'));
```

#### **9.2.2 Delegation Pattern**
```typescript
// ✅ CORRECT: Content scripts delegate to background for AI processing
export async function analyzeUpdateQuality(
  updateText: string,
  updateType?: string,
  state?: string
): Promise<UpdateQualityResult> {
  // If we're in a content script, delegate to background script
  if (isContentScript) {
    return await analyzeUpdateQualityViaBackground(updateText, updateType, state);
  }
  
  // Background script performs AI analysis
  // ... AI model loading and analysis logic
}
```

#### **9.2.3 Background Script AI Processing**
```typescript
// ✅ CORRECT: Background script handles all AI operations
async function analyzeUpdateQualityViaBackground(
  updateText: string,
  updateType?: string,
  state?: string
): Promise<UpdateQualityResult> {
  try {
    // Initialize AI models
    await initializeModels();
    
    // Determine applicable criteria
    const applicableCriteria = determineApplicableCriteria(updateType, state, updateText);
    
    // Analyze each criterion using AI
    const analysisPromises = applicableCriteria.map(async (criteria) => {
      return await analyzeCriterionWithAI(updateText, criteria);
    });
    
    const analysis = await Promise.all(analysisPromises);
    
    // Calculate quality score and generate summary
    // ... AI-powered analysis logic
  } catch (error) {
    throw new Error('AI analysis failed - no fallback allowed');
  }
}
```

### **9.3 AI Quality Criteria**

#### **9.3.1 Quality Assessment Framework**
```typescript
// ✅ CORRECT: AI-powered quality criteria analysis
const QUALITY_CRITERIA = [
  {
    id: 'decision-required',
    title: 'Decision Required',
    requiredAnswers: 3,
    questions: [
      'What decision needs to be made?',
      'What are the options being considered?',
      'What is the timeline for the decision?'
    ]
  },
  {
    id: 'paused',
    title: 'Project Paused',
    requiredAnswers: 2,
    questions: [
      'Why was the project paused?',
      'When will it resume?'
    ]
  }
  // ... additional criteria
];
```

#### **9.3.2 AI Question Answering**
```typescript
// ✅ CORRECT: AI extracts answers to quality criteria questions
async function analyzeCriterionWithAI(
  updateText: string, 
  criteria: QualityCriteria
): Promise<QualityAnalysis> {
  const answers = await Promise.all(
    criteria.questions.map(async (question) => {
      return await extractAnswerWithAI(updateText, question);
    })
  );
  
  // AI-powered scoring based on answer quality
  const score = await calculateAIScore(answers, criteria);
  
  return {
    criteriaId: criteria.id,
    title: criteria.title,
    score,
    maxScore: criteria.requiredAnswers,
    answers,
    missingInfo: await identifyMissingInfo(updateText, criteria, answers),
    recommendations: await generateAIRecommendations(updateText, criteria, answers)
  };
}
```

### **9.4 AI Model Management**

#### **9.4.1 Lazy Loading Strategy**
- **Models loaded on demand** - only when first analysis is requested
- **Singleton model instances** - reuse loaded models across analyses
- **Memory management** - models kept in memory for performance

#### **9.4.2 Model Selection**
```typescript
// ✅ CORRECT: Specialized models for different analysis tasks
const models = {
  qa: 'Xenova/distilbert-base-cased-distilled-squad',      // Question answering
  sentiment: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', // Sentiment analysis
  summarization: 'Xenova/sshleifer-tiny-cnn'               // Text summarization
};
```

#### **9.4.3 Error Handling for AI**
```typescript
// ✅ CORRECT: AI failures result in no analysis, not fallback
try {
  await initializeModels();
  // ... AI analysis
} catch (error) {
  console.error('❌ AI analysis failed:', error);
  throw new Error('AI quality analysis failed - no fallback allowed');
}
```

### **9.5 AI Analysis Integration**

#### **9.5.1 Database Integration**
- **Analysis results stored** directly in ProjectUpdate records
- **Quality metrics** - score (0-100), level (excellent/good/fair/poor)
- **AI-generated content** - summary, missing info, recommendations
- **Analysis metadata** - timestamp, model versions used

#### **9.5.2 UI Integration**
- **Real-time quality display** - useLiveQuery for reactive updates
- **Quality indicators** - color-coded quality levels
- **AI insights display** - show AI-generated recommendations
- **Performance monitoring** - track AI analysis completion rates

#### **9.5.3 Background Processing**
- **Automatic analysis** - triggered by new ProjectUpdate additions
- **Batch processing** - analyze multiple updates efficiently
- **Progress tracking** - show analysis status in UI
- **Error reporting** - log AI analysis failures for debugging

## 🧪 **TESTING PRINCIPLES**

### **10.1 Testing Strategy**

#### **10.1.1 Test Pyramid**
```
        /\
       /  \     E2E Tests (Few, Critical Paths)
      /____\    
     /      \   Integration Tests (Some, Service Boundaries)
    /________\  
   /          \  Unit Tests (Many, Individual Functions)
  /____________\
```

#### **10.1.2 Test Coverage**
- **Unit tests** - test individual functions and components
- **Integration tests** - test service interactions
- **E2E tests** - test critical user workflows

#### **10.1.3 Test Data**
- **Isolated test data** - each test has its own data
- **Realistic test scenarios** - use data that matches production
- **Cleanup after tests** - remove test data to prevent interference

### **10.2 Testing Patterns**

#### **10.2.1 Component Testing**
```typescript
// ✅ CORRECT: Test component behavior, not implementation
test('shows loading state while fetching projects', async () => {
  render(<ProjectList />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

// ❌ WRONG: Test implementation details
test('calls useEffect with correct dependencies', () => {
  // Implementation detail, not behavior
});
```

#### **10.2.2 Service Testing**
```typescript
// ✅ CORRECT: Test service behavior with mocks
test('fetches projects from server and stores in database', async () => {
  const mockApi = { fetchProjects: jest.fn() };
  const service = new ProjectService(mockApi);
  
  await service.refreshProjects();
  
  expect(mockApi.fetchProjects).toHaveBeenCalled();
  expect(db.projectViews.count()).resolves.toBeGreaterThan(0);
});
```

## 📁 **CODE ORGANIZATION**

### **11.1 Directory Structure**

```
src/
├── components/              # React components
│   ├── FloatingButton/     # Feature-based organization
│   ├── ProjectModal/       # Each component in its own directory
│   └── Timeline/           # With associated files
├── services/               # Business logic services
│   ├── ProjectService.ts   # One service per domain
│   ├── UpdateService.ts    # Clear responsibilities
│   └── AnalysisService.ts  # Singleton pattern
├── utils/                  # Pure utility functions
│   ├── database.ts         # Database utilities
│   ├── dateUtils.ts        # Date manipulation
│   └── textUtils.ts        # Text processing
├── types/                  # TypeScript type definitions
│   ├── index.ts            # Main type exports
│   ├── database.ts         # Database types
│   └── api.ts              # API types
├── hooks/                  # Custom React hooks
│   ├── useProjectData.ts   # Database-focused hooks
│   └── useAnalysis.ts      # Analysis-focused hooks
└── graphql/                # GraphQL queries and mutations
    ├── projectQueries.ts   # Project-related queries
    └── updateQueries.ts    # Update-related queries
```

### **11.2 File Organization Rules**

#### **11.2.1 Component Files**
```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.scss      # Component styles
├── ComponentName.test.tsx  # Component tests
└── index.ts               # Public exports
```

#### **11.2.2 Service Files**
```
ServiceName.ts              # Single service class
ServiceName.test.ts         # Service tests
```

#### **11.2.3 Utility Files**
```
utilityName.ts              # Grouped related utilities
utilityName.test.ts         # Utility tests
```

## 🏷️ **NAMING CONVENTIONS**

### **12.1 File Naming**

#### **12.1.1 Components**
- **PascalCase** for component files: `ProjectList.tsx`
- **Descriptive names** that indicate purpose: `ProjectStatusModal.tsx`
- **Feature-based organization**: `ProjectList/ProjectList.tsx`

#### **12.1.2 Services**
- **PascalCase** with "Service" suffix: `ProjectService.ts`
- **Clear domain names**: `UpdateAnalysisService.ts`
- **No "simple" prefixes** - use descriptive names

#### **12.1.3 Utilities**
- **camelCase** for utility files: `dateUtils.ts`
- **Grouped by function**: `textUtils.ts`, `validationUtils.ts`
- **No generic names**: avoid `utils.ts`, `helpers.ts`

### **12.2 Function Naming**

#### **12.2.1 Database Operations**
```typescript
// ✅ CORRECT: Clear, descriptive names
async getProjectByKey(key: string): Promise<ProjectView>
async saveProject(project: ProjectView): Promise<void>
async deleteProject(key: string): Promise<void>

// ❌ WRONG: Unclear or abbreviated names
async get(key: string): Promise<ProjectView>        // Too generic
async save(project: ProjectView): Promise<void>     // Too generic
async del(key: string): Promise<void>               // Abbreviated
```

#### **12.2.2 Service Methods**
```typescript
// ✅ CORRECT: Action-oriented names
async fetchProjectsFromServer(tql: string): Promise<ProjectView[]>
async refreshProjectData(projectKey: string): Promise<void>
async analyzeUpdateQuality(update: ProjectUpdate): Promise<void>

// ❌ WRONG: Unclear or passive names
async getProjects(tql: string): Promise<ProjectView[]>     // Unclear source
async updateProject(projectKey: string): Promise<void>     // Unclear what updates
async doAnalysis(update: ProjectUpdate): Promise<void>     // Unclear what analysis
```

### **12.3 Variable Naming**

#### **12.3.1 Database Variables**
```typescript
// ✅ CORRECT: Clear, descriptive names
const projectViews = await db.projectViews.toArray();
const updateCount = await db.projectUpdates.count();
const analyzedUpdates = await db.projectUpdates.where('updateQuality').above(0).toArray();

// ❌ WRONG: Unclear or abbreviated names
const data = await db.projectViews.toArray();              // Too generic
const count = await db.projectUpdates.count();             // Unclear what count
const updates = await db.projectUpdates.where('updateQuality').above(0).toArray(); // Unclear filter
```

#### **12.3.2 Component Variables**
```typescript
// ✅ CORRECT: Clear, descriptive names
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

// ❌ WRONG: Unclear or abbreviated names
const [open, setOpen] = useState(false);                   // Unclear what's open
const [selected, setSelected] = useState<string | null>(null); // Unclear what's selected
const [loading, setLoading] = useState(false);             // Unclear what's loading
```

## 🔄 **MIGRATION RULES**

### **13.1 Database Migrations**

#### **13.1.1 Schema Changes**
- **Never change existing fields** without migration
- **Add new fields** as optional to maintain compatibility
- **Version database** to handle schema evolution
- **Test migrations** thoroughly before deployment

#### **13.1.2 Migration Process**
```typescript
// ✅ CORRECT: Version-based migrations
export class AtlasXrayDB extends Dexie {
  constructor() {
    super('AtlasXrayDB');
    
    this.version(1).stores({
      projectViews: 'projectKey',
      projectUpdates: 'uuid, projectKey, creationDate, updateQuality',
      meta: 'key'
    });
    
    this.version(2).stores({
      projectViews: 'projectKey, team', // Add new index
      projectUpdates: 'uuid, projectKey, creationDate, updateQuality, analysisDate', // Add new field
      meta: 'key'
    }).upgrade(tx => {
      // Migration logic for existing data
      return tx.table('projectUpdates').toCollection().modify(update => {
        update.analysisDate = update.creationDate; // Set default value
      });
    });
  }
}
```

### **13.2 Code Migrations**

#### **13.2.1 Breaking Changes**
- **Deprecate old APIs** before removing them
- **Provide migration guides** for developers
- **Maintain backward compatibility** when possible
- **Version major changes** appropriately

#### **13.2.2 Migration Strategy**
```typescript
// ✅ CORRECT: Gradual migration with deprecation
class ProjectService {
  // Deprecated method - will be removed in next major version
  @deprecated('Use fetchProjectsFromServer instead')
  async getProjects(tql: string): Promise<ProjectView[]> {
    return this.fetchProjectsFromServer(tql);
  }
  
  // New method - preferred approach
  async fetchProjectsFromServer(tql: string): Promise<ProjectView[]> {
    // New implementation
  }
}
```

## 📝 **IMPLEMENTATION CHECKLIST**

### **14.1 Before Making Changes**

- [ ] **Review this document** for relevant principles
- [ ] **Check existing patterns** in similar code
- [ ] **Consider impact** on database schema
- [ ] **Plan migration strategy** if breaking changes
- [ ] **Update tests** to reflect changes

### **14.2 During Implementation**

- [ ] **Follow naming conventions** consistently
- [ ] **Use established patterns** for similar functionality
- [ ] **Maintain separation of concerns**
- [ ] **Handle errors gracefully**
- [ ] **Add appropriate logging**

### **14.3 After Implementation**

- [ ] **Verify no regressions** in existing functionality
- [ ] **Check performance impact** of changes
- [ ] **Update documentation** if APIs change
- [ ] **Run full test suite** to ensure quality
- [ ] **Review with team** for architectural consistency

## 🚨 **VIOLATION CONSEQUENCES**

### **15.1 Code Review Rejection**
- **Changes that violate principles** will be rejected
- **Architectural inconsistencies** must be resolved before merge
- **Performance regressions** require investigation and resolution

### **15.2 Technical Debt**
- **Violations create technical debt** that must be addressed
- **Architectural drift** reduces code quality over time
- **Maintenance burden** increases with each violation

### **15.3 Team Accountability**
- **All team members** are responsible for upholding principles
- **Code reviews** must enforce architectural consistency
- **Regular audits** help identify and resolve violations

## 📚 **REFERENCES & RESOURCES**

### **16.1 External Resources**
- [Dexie.js Documentation](https://dexie.org/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Guidelines](https://www.typescriptlang.org/docs/)
- [Performance Best Practices](https://web.dev/performance/)

### **16.2 Internal Resources**
- [Project README](./README.md)
- [Component Library](./src/components/)
- [Service Examples](./src/services/)
- [Test Patterns](./src/tests/)

## 🔄 **DOCUMENT MAINTENANCE**

### **17.1 Update Process**
- **Review quarterly** for relevance and completeness
- **Update when patterns evolve** based on team experience
- **Add new principles** as they emerge from development
- **Remove outdated guidance** that no longer applies

### **16.2 Version History**
- **Version 1.0** - Initial architecture principles
- **Track changes** in git history
- **Document rationale** for significant changes
- **Team approval** required for major updates

---

*This document is a living guide that evolves with our codebase. All team members must understand and follow these principles to maintain code quality and architectural consistency.*

**Last Updated**: December 2024  
**Next Review**: March 2025  
**Maintainer**: Development Team

## ⚠️ **ERROR HANDLING**

### **8.1 Error Handling Principles**

#### **8.1.1 Graceful Degradation**
- **Fallback values** - provide reasonable defaults when operations fail
- **User feedback** - inform users of errors and recovery options
- **Continue operation** - don't crash the entire application

#### **8.1.2 Error Boundaries**
```typescript
// ✅ CORRECT: Catch errors at component boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error, show fallback UI
    console.error('Component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    
    return this.props.children;
  }
}
```

### **7.2 Monitoring Patterns**

#### **7.2.1 Change Detection**
```typescript
// ✅ CORRECT: Monitor for relevant changes
useEffect(() => {
  const handleUrlChange = () => {
    // Handle URL changes that affect data
  };
  
  window.addEventListener('popstate', handleUrlChange);
  return () => window.removeEventListener('popstate', handleUrlChange);
}, []);

// ✅ CORRECT: Monitor database changes
const projects = useLiveQuery(() => db.projectViews.toArray());
// Automatically updates when database changes
```

#### **7.2.2 Performance Monitoring**
```typescript
// ✅ CORRECT: Monitor performance metrics
useEffect(() => {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    if (duration > 100) {
      console.warn(`Slow operation: ${duration}ms`);
    }
  };
}, []);
```

## 🔄 **UPDATED DATA FLOW ARCHITECTURE** (December 2024)

### **17.1 New Data Loading Flow**

#### **17.1.1 User-Initiated Loading Pattern**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Click    │    │   Loading       │    │   Data          │
│   Floating      │───▶│   Screen        │───▶│   Services      │
│   Button        │    │   (Progress)    │    │   (Sequential)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Timeline      │    │   Database      │
                       │   Modal         │◀───│   (IndexedDB)   │
                       └─────────────────┘    └─────────────────┘
```

#### **17.1.2 Sequential Loading Steps**
1. **🚀 Initialization** (DirectoryViewProjectQuery.js)
   - Load bootstrap data (workspace context)
   - Extract visible project keys from DOM
   - Progress: 0-100% with real-time updates

2. **📊 Project Information** (projectViewAsideQuery.js)
   - Fetch minimal project data for heatmap rendering
   - Store essential fields only (name, status, archived, creation date)
   - Progress: 0-100% with real-time updates

3. **📅 Project Updates** (projectUpdateQuery.js)
   - Fetch timeline data for project updates
   - Store update records with dates, states, summaries
   - Progress: 0-100% with real-time updates

4. **🔗 Dependencies** (projectViewAsideQuery.js)
   - Check and store project dependencies
   - Update dependency graph for visualization
   - Progress: 0-100% with real-time updates

#### **17.1.3 Service Architecture**
```typescript
// NEW: Specialized services for each data type
class ProjectBasicInfoService {
  // Fetches minimal project info needed for heatmap
  async fetchBasicProjectInfo(projectKeys: string[]): Promise<ProjectBasicInfo[]>
  async needsRefresh(projectKey: string): Promise<boolean> // 24-hour freshness check
}

class ProjectUpdateService {
  // Fetches project updates for timeline rendering
  async fetchProjectUpdates(projectKeys: string[]): Promise<Map<string, ProjectUpdateInfo[]>>
  async needsRefresh(projectKey: string): Promise<boolean> // 24-hour freshness check
}

class ProjectDependencyService {
  // Manages project dependencies and relationships
  async fetchDependencies(projectKeys: string[]): Promise<ProjectDependency[]>
  async needsRefresh(projectKey: string): Promise<boolean> // 24-hour freshness check
}
```

### **17.2 Loading Screen Implementation**

#### **17.2.1 Progress Tracking**
```typescript
interface LoadingStep {
  id: string;                                    // Step identifier
  label: string;                                 // User-friendly description
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;                              // 0-100 progress percentage
  errorMessage?: string;                         // Error details if failed
}

// Overall progress calculation
const calculateOverallProgress = (): number => {
  const totalSteps = loadingSteps.length;
  const completedSteps = loadingSteps.filter(step => step.status === 'completed').length;
  const loadingStep = loadingSteps.find(step => step.status === 'loading');
  
  if (loadingStep) {
    return Math.round((completedSteps / totalSteps) * 100 + (loadingStep.progress / totalSteps));
  }
  
  return Math.round((completedSteps / totalSteps) * 100);
};
```

#### **17.2.2 Real-Time Progress Updates**
```typescript
// Simulate progress for each step with intervals
const bootstrapInterval = setInterval(() => {
  const currentStep = loadingSteps.find(step => step.id === 'bootstrap');
  const newProgress = Math.min((currentStep?.progress || 0) + 10, 90);
  updateLoadingStep('bootstrap', { progress: newProgress });
}, 100);

// Complete step when operation finishes
await bootstrapService.loadBootstrapData();
clearInterval(bootstrapInterval);
updateLoadingStep('bootstrap', { status: 'completed', progress: 100 });
```

### **17.3 Enhanced Timeline Features**

#### **17.3.1 Days Shift Column**
```typescript
// Calculate total days between original and most recent target dates
const daysShift = useMemo(() => {
  if (!updates || updates.length === 0) return null;

  // Find earliest target date (original)
  const originalTargetDate = updates
    .filter(u => u.oldDueDate || u.targetDate)
    .sort((a, b) => new Date(a.oldDueDate || a.targetDate || '').getTime() - 
                    new Date(b.oldDueDate || b.targetDate || '').getTime())[0]
    ?.oldDueDate || updates[0]?.targetDate;

  // Find most recent target date
  const recentTargetDate = updates
    .filter(u => u.newDueDate || u.targetDate)
    .sort((a, b) => new Date(b.newDueDate || b.targetDate || '').getTime() - 
                    new Date(a.newDueDate || a.targetDate || '').getTime())[0]
    ?.newDueDate || updates[0]?.targetDate;

  if (!originalTargetDate || !recentTargetDate) return null;

  const diffTime = new Date(recentTargetDate).getTime() - new Date(originalTargetDate).getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}, [updates]);
```

#### **17.3.2 Grid Layout with Days Shift**
```scss
.timeline-header {
  display: grid;
  grid-template-columns: 300px repeat(auto-fit, minmax(80px, 1fr)) 150px 120px;
  // Project Info | Week Columns | Target Date | Days Shift
}

.timeline-row {
  display: grid;
  grid-template-columns: 300px repeat(auto-fit, minmax(80px, 1fr)) 150px 120px;
  // Same grid structure for consistency
}
```

### **17.4 Smart Caching Strategy**

#### **17.4.1 Freshness Thresholds**
```typescript
// 24-hour freshness threshold for all data types
const refreshThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async needsRefresh(projectKey: string): Promise<boolean> {
  try {
    const existing = await db.getProjectView(projectKey);
    if (!existing) return true;

    const lastUpdated = new Date(existing.lastUpdated).getTime();
    const now = Date.now();
    
    return (now - lastUpdated) > refreshThreshold;
  } catch (error) {
    return true; // Refresh on error
  }
}
```

#### **17.4.2 Conditional Data Fetching**
```typescript
// Only fetch data that needs refresh
const projectsNeedingRefresh = [];
const results = [];

for (const projectKey of projectKeys) {
  if (await this.needsRefresh(projectKey)) {
    projectsNeedingRefresh.push(projectKey);
  } else {
    // Use existing data
    const existing = await db.getProjectView(projectKey);
    if (existing) results.push(existing);
  }
}

// Fetch fresh data only for projects that need it
if (projectsNeedingRefresh.length > 0) {
  const freshData = await this.fetchFreshData(projectsNeedingRefresh);
  results.push(...freshData);
}
```

### **17.5 Error Handling & User Feedback**

#### **17.5.1 Enhanced Error Messages**
```typescript
// Context-aware error messages based on current page
if (visibleProjectKeys.length === 0) {
  let errorMessage = 'No visible projects found on current page.';
  
  if (currentUrl.includes('atlassian.com')) {
    if (currentUrl.includes('/projects')) {
      errorMessage = 'No project keys found on this projects page. Please ensure you are viewing a list of projects with project keys (e.g., PROJ-123).';
    } else if (currentUrl.includes('/browse/')) {
      errorMessage = 'No project keys found on this project page. Please ensure you are viewing a project with a project key.';
    } else {
      errorMessage = 'No project keys found. Please navigate to a projects list page or individual project page.';
    }
  }
  
  throw new Error(errorMessage);
}
```

#### **17.5.2 Loading Screen Error States**
```typescript
// Mark current loading step as error with detailed message
const currentLoadingStep = loadingSteps.find(step => step.status === 'loading');
if (currentLoadingStep) {
  updateLoadingStep(currentLoadingStep.id, { 
    status: 'error', 
    errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
  });
}
```

### **17.6 Performance Optimizations**

#### **17.6.1 DOM Scanning Efficiency**
```typescript
// Multiple strategies for project key extraction
// Strategy 1: Text content scanning (comprehensive)
// Strategy 2: Specific Atlassian elements (targeted)
// Strategy 3: Project links and URLs (structured)
// Strategy 4: Project table rows (organized)
// Fallback: URL and page title extraction
```

#### **17.6.2 Batch Operations**
```typescript
// Fetch data for multiple projects in parallel where possible
const projectInfoPromises = projectsNeedingRefresh.map(projectKey => 
  this.fetchSingleProjectBasicInfo(projectKey)
);

const results = await Promise.allSettled(projectInfoPromises);
// Handle successful and failed results appropriately
```

### **17.7 Migration from Old Architecture**

#### **17.7.1 Replaced Components**
- ❌ `simpleProjectListFetcher` → ✅ `ProjectBasicInfoService`
- ❌ Automatic page load fetching → ✅ User-initiated loading
- ❌ Single data fetch → ✅ Sequential, progress-tracked loading

#### **17.7.2 Maintained Components**
- ✅ `useLiveQuery` for reactive UI updates
- ✅ `DatabaseService` for data persistence
- ✅ `StatusTimelineHeatmap` for timeline display
- ✅ GraphQL queries for data fetching

#### **17.7.3 New Components**
- 🆕 `LoadingScreen` for progress visualization
- 🆕 `ProjectBasicInfoService` for minimal project data
- 🆕 `ProjectUpdateService` for timeline data
- 🆕 Enhanced timeline with days shift column

---

**This section documents the major architectural changes implemented in December 2024 to improve user experience, data loading efficiency, and timeline visualization capabilities.**

## 5.7 DatabaseService as Pure Data Repository

**PRINCIPLE**: DatabaseService serves as a pure data repository with no business logic.

### **Responsibilities:**
- **Data persistence and retrieval only** (CRUD operations)
- **NO business logic** - services handle all business decisions
- **NO API calls** - services handle all external communication
- **NO data transformation** - services handle all data processing
- **Single source of truth** for all project data across services

### **Architecture Benefits:**
- **Clean separation** between data access and business logic
- **Services remain independent** in their business responsibilities
- **Easy cross-service lookups** - any service can read data from any other service
- **Consistent data schema** across all services
- **No code duplication** in database setup and management

### **Service Usage Pattern:**
```typescript
// Services use DatabaseService for data operations
class FetchProjectsList {
  async getProjectList(): Promise<string[]> {
    // Business logic: check if refresh is needed
    if (await this.needsRefresh()) {
      return await this.fetchFromAPI();
    }
    
    // Data access: delegate to DatabaseService
    return await db.getProjectViews().then(views => views.map(v => v.projectKey));
  }
}
```

### **Data Flow:**
1. **Services** contain business logic and API calls
2. **DatabaseService** provides pure data persistence/retrieval
3. **UI Components** read data directly from DatabaseService
4. **Cross-service data access** is seamless and efficient

### **Key Methods Available:**
- `storeProjectView()` / `getProjectView()` / `getProjectViews()`
- `storeProjectUpdate()` / `getProjectUpdates()` / `getProjectUpdatesByKey()`
- `storeProjectDependencies()` / `getProjectDependencies()` / `getAllProjectDependencies()`
- All methods are pure CRUD operations with no side effects
