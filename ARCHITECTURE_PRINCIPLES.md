# 🏗️ ATLAS XRAY ARCHITECTURE PRINCIPLES & RULES

*This document serves as our architectural constitution - all changes must adhere to these principles*

## 🎯 **CORE PRINCIPLES**

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

## 🗄️ **DATABASE ARCHITECTURE**

### **2.1 Database Schema**

```typescript
// Core tables - these are immutable and cannot be changed without migration
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
  
  // Analysis results - stored directly in update record
  updateQuality?: number;    // Quality score 0-100
  qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor';
  qualitySummary?: string;   // Human-readable quality summary
  qualityMissingInfo?: string[]; // Missing information points
  qualityRecommendations?: string[]; // Improvement recommendations
  analysisDate?: string;     // When analysis was performed
}

interface MetaData {
  key: string;               // Primary key - metadata identifier
  value: string;             // Metadata value (JSON string for complex data)
  lastUpdated: string;       // ISO date string
}
```

### **2.2 Database Rules**

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

## 🧪 **TESTING PRINCIPLES**

### **9.1 Testing Strategy**

#### **9.1.1 Test Pyramid**
```
        /\
       /  \     E2E Tests (Few, Critical Paths)
      /____\    
     /      \   Integration Tests (Some, Service Boundaries)
    /________\  
   /          \  Unit Tests (Many, Individual Functions)
  /____________\
```

#### **9.1.2 Test Coverage**
- **Unit tests** - test individual functions and components
- **Integration tests** - test service interactions
- **E2E tests** - test critical user workflows

#### **9.1.3 Test Data**
- **Isolated test data** - each test has its own data
- **Realistic test scenarios** - use data that matches production
- **Cleanup after tests** - remove test data to prevent interference

### **9.2 Testing Patterns**

#### **9.2.1 Component Testing**
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

#### **9.2.2 Service Testing**
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

### **10.1 Directory Structure**

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

### **10.2 File Organization Rules**

#### **10.2.1 Component Files**
```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.scss      # Component styles
├── ComponentName.test.tsx  # Component tests
└── index.ts               # Public exports
```

#### **10.2.2 Service Files**
```
ServiceName.ts              # Single service class
ServiceName.test.ts         # Service tests
```

#### **10.2.3 Utility Files**
```
utilityName.ts              # Grouped related utilities
utilityName.test.ts         # Utility tests
```

## 🏷️ **NAMING CONVENTIONS**

### **11.1 File Naming**

#### **11.1.1 Components**
- **PascalCase** for component files: `ProjectList.tsx`
- **Descriptive names** that indicate purpose: `ProjectStatusModal.tsx`
- **Feature-based organization**: `ProjectList/ProjectList.tsx`

#### **11.1.2 Services**
- **PascalCase** with "Service" suffix: `ProjectService.ts`
- **Clear domain names**: `UpdateAnalysisService.ts`
- **No "simple" prefixes** - use descriptive names

#### **11.1.3 Utilities**
- **camelCase** for utility files: `dateUtils.ts`
- **Grouped by function**: `textUtils.ts`, `validationUtils.ts`
- **No generic names**: avoid `utils.ts`, `helpers.ts`

### **11.2 Function Naming**

#### **11.2.1 Database Operations**
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

#### **11.2.2 Service Methods**
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

### **11.3 Variable Naming**

#### **11.3.1 Database Variables**
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

#### **11.3.2 Component Variables**
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

### **12.1 Database Migrations**

#### **12.1.1 Schema Changes**
- **Never change existing fields** without migration
- **Add new fields** as optional to maintain compatibility
- **Version database** to handle schema evolution
- **Test migrations** thoroughly before deployment

#### **12.1.2 Migration Process**
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

### **12.2 Code Migrations**

#### **12.2.1 Breaking Changes**
- **Deprecate old APIs** before removing them
- **Provide migration guides** for developers
- **Maintain backward compatibility** when possible
- **Version major changes** appropriately

#### **12.2.2 Migration Strategy**
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

### **13.1 Before Making Changes**

- [ ] **Review this document** for relevant principles
- [ ] **Check existing patterns** in similar code
- [ ] **Consider impact** on database schema
- [ ] **Plan migration strategy** if breaking changes
- [ ] **Update tests** to reflect changes

### **13.2 During Implementation**

- [ ] **Follow naming conventions** consistently
- [ ] **Use established patterns** for similar functionality
- [ ] **Maintain separation of concerns**
- [ ] **Handle errors gracefully**
- [ ] **Add appropriate logging**

### **13.3 After Implementation**

- [ ] **Verify no regressions** in existing functionality
- [ ] **Check performance impact** of changes
- [ ] **Update documentation** if APIs change
- [ ] **Run full test suite** to ensure quality
- [ ] **Review with team** for architectural consistency

## 🚨 **VIOLATION CONSEQUENCES**

### **14.1 Code Review Rejection**
- **Changes that violate principles** will be rejected
- **Architectural inconsistencies** must be resolved before merge
- **Performance regressions** require investigation and resolution

### **14.2 Technical Debt**
- **Violations create technical debt** that must be addressed
- **Architectural drift** reduces code quality over time
- **Maintenance burden** increases with each violation

### **14.3 Team Accountability**
- **All team members** are responsible for upholding principles
- **Code reviews** must enforce architectural consistency
- **Regular audits** help identify and resolve violations

## 📚 **REFERENCES & RESOURCES**

### **15.1 External Resources**
- [Dexie.js Documentation](https://dexie.org/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Guidelines](https://www.typescriptlang.org/docs/)
- [Performance Best Practices](https://web.dev/performance/)

### **15.2 Internal Resources**
- [Project README](./README.md)
- [Component Library](./src/components/)
- [Service Examples](./src/services/)
- [Test Patterns](./src/tests/)

## 🔄 **DOCUMENT MAINTENANCE**

### **16.1 Update Process**
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
