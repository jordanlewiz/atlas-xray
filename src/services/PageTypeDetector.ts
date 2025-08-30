export enum PageType {
  PROJECT_LIST = 'Project List',
  PROJECT_TIMELINE = 'Project Timeline', 
  PROJECT_VIEW = 'Project View',
  TAGS = 'Tags',
  GOAL_LIST = 'Goal List',
  GOAL_TIMELINE = 'Goal Timeline',
  GOAL_VIEW = 'Goal View',
  UNKNOWN = 'Unknown'
}

export class PageTypeDetector {
  private static patterns = [
    { type: PageType.PROJECT_TIMELINE, regex: /\/projects\?.*view=timeline/ },
    { type: PageType.PROJECT_LIST, regex: /\/projects\?/ },
    { type: PageType.PROJECT_VIEW, regex: /\/project\/[^\/]+\/updates/ },
    { type: PageType.TAGS, regex: /\/tags\?/ },
    { type: PageType.GOAL_TIMELINE, regex: /\/goals\?.*view=timeline/ },
    { type: PageType.GOAL_LIST, regex: /\/goals\?/ },
    { type: PageType.GOAL_VIEW, regex: /\/goal\/[^\/]+/ }
  ];

  static detectPageType(url: string = window.location.href): PageType {
    for (const { type, regex } of this.patterns) {
      if (regex.test(url)) return type;
    }
    return PageType.UNKNOWN;
  }

  static startMonitoring(): void {
    const checkAndLoadButtons = () => {
      const pageType = this.detectPageType();
      
      console.log(`[PageTypeDetector] �� Detected page type: ${pageType}`);
      console.log(`[PageTypeDetector] 📍 Current URL: ${window.location.href}`);
      
      // Always clean up existing buttons first
      this.cleanupButtons();
      
      // Then mount appropriate buttons for current page type
      if (pageType === PageType.PROJECT_TIMELINE) {
        console.log(`[PageTypeDetector] 🚀 Mounting buttons for ${pageType}: FloatingButton + DependencyButton`);
        this.mountFloatingButton();
        this.mountDependencyButton();
      } else if (pageType === PageType.PROJECT_LIST) {
        console.log(`[PageTypeDetector] 🚀 Mounting buttons for ${pageType}: FloatingButton only`);
        this.mountFloatingButton();
      } else {
        console.log(`[PageTypeDetector] 🚫 No buttons mounted for ${pageType} - clean state`);
      }
      
      console.log(`[PageTypeDetector] ✨ Button management complete for ${pageType}`);
    };
    
    checkAndLoadButtons(); // Initial check
    window.addEventListener('popstate', checkAndLoadButtons);
    window.addEventListener('hashchange', checkAndLoadButtons);
    
    // SPA navigation detection
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.log(`[PageTypeDetector] 🔄 SPA navigation detected - URL changed to: ${window.location.href}`);
        checkAndLoadButtons();
      }
    }).observe(document.body, { childList: true, subtree: true });
    
    console.log('[PageTypeDetector] 🚀 Page type monitoring started successfully');
  }

  private static cleanupButtons(): void {
    // Remove floating button
    const floatingBtn = document.getElementById('atlas-xray-floating-btn');
    if (floatingBtn) {
      floatingBtn.remove();
      console.log('[PageTypeDetector] 🧹 Cleaned up FloatingButton');
    }

    // Remove dependency button and cleanup service
    const dependencyBtn = document.getElementById('atlas-xray-timeline-btn');
    if (dependencyBtn) {
      dependencyBtn.remove();
      
      // Cleanup TimelineProjectService
      (async () => {
        try {
          const { TimelineProjectService } = await import('./TimelineProjectService');
          TimelineProjectService.cleanupUrlChangeListener();
          TimelineProjectService.clearAllLines();
        } catch (error) {
          console.warn('[PageTypeDetector] ⚠️ Could not cleanup TimelineProjectService:', error);
        }
      })();
      
      console.log('[PageTypeDetector] 🧹 Cleaned up DependencyButton');
    }
  }

  private static mountFloatingButton(): void {
    if (!document.getElementById('atlas-xray-floating-btn')) {
      (async () => {
        const React = await import('react');
        const { createRoot } = await import('react-dom/client');
        const FloatingButton = (await import('../components/FloatingButton/FloatingButton')).default;
        await import('../components/FloatingButton/FloatingButton.scss');
        
        const container = document.createElement('div');
        document.body.appendChild(container);
        createRoot(container).render(React.createElement(FloatingButton));
        console.log('[PageTypeDetector] ✅ FloatingButton mounted successfully');
      })();
    } else {
      console.log('[PageTypeDetector] ℹ️ FloatingButton already exists, skipping mount');
    }
  }

  private static mountDependencyButton(): void {
    if (!document.getElementById('atlas-xray-timeline-btn')) {
      const btn = document.createElement('button');
      btn.id = 'atlas-xray-timeline-btn';
      btn.textContent = 'Show dependencies';
      btn.addEventListener('click', async () => {
        const { TimelineProjectService } = await import('./TimelineProjectService');
        await TimelineProjectService.toggleDependencies();
        btn.textContent = TimelineProjectService.getDependenciesVisible() ? 'Hide dependencies' : 'Show dependencies';
      });
      document.body.appendChild(btn);
      console.log('[PageTypeDetector] ✅ DependencyButton mounted successfully');
    } else {
      console.log('[PageTypeDetector] ℹ️ DependencyButton already exists, skipping mount');
    }
  }
}
