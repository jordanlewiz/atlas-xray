import detectUrlChange from 'detect-url-change';
import { log, setFilePrefix } from '../utils/logger';

// Set file-level prefix for all logging in this file
setFilePrefix('[PageTypeDetector]');

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
  // Create logger instance for this service

  

  
  private static currentPageType: PageType | null = null;
  private static floatingButtonContainer: HTMLElement | null = null;
  private static floatingButtonRoot: any = null;
  
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
    log.debug('[PageTypeDetector]', 'detectPageType() called with URL:', url);
    

    
    for (const { type, regex } of this.patterns) {
      log.debug('Testing pattern:', type, 'regex:', regex);
              if (regex.test(url)) {
          log.info('Pattern matched:', type);
          return type;
        }
    }
    
    log.warn('No pattern matched, returning UNKNOWN');
    return PageType.UNKNOWN;
  }

  static startMonitoring(): void {
    log.info('Page type monitoring started');
    
    const checkAndLoadButtons = () => {
      log.debug('checkAndLoadButtons() called');
      const newPageType = this.detectPageType();
      log.debug(`Detected page type: ${newPageType}`);
      log.info(`📍 Current URL: ${window.location.href}`);
      
      // Only cleanup and remount if page type actually changed
      if (this.currentPageType !== newPageType) {

        log.debug(`🔄 Page type changed from ${this.currentPageType} to ${newPageType}`);
        
        // Clean up existing buttons
        this.cleanupButtons();
        
        // Update current page type
        this.currentPageType = newPageType;
        
        // Mount appropriate buttons for new page type
        if (newPageType === PageType.PROJECT_TIMELINE) {
          log.debug(`🚀 Mounting buttons for ${newPageType}: FloatingButton + DependencyButton`);
          this.mountFloatingButton();
          this.mountDependencyButton();
        } else if (newPageType === PageType.PROJECT_LIST) {
          log.debug(`🚀 Mounting buttons for ${newPageType}: FloatingButton only`);
          this.mountFloatingButton();
        } else {
          log.debug(`🚫 No buttons mounted for ${newPageType} - clean state`);
        }
        
        log.info(`✨ Button management complete for ${newPageType}`);
      } else {
        log.info(`ℹ️ Same page type (${newPageType}), no button changes needed`);
      }
    };
    
    checkAndLoadButtons(); // Initial check
    window.addEventListener('popstate', checkAndLoadButtons);
    window.addEventListener('hashchange', checkAndLoadButtons);
    
    // Simple, reliable SPA navigation detection using detect-url-change package
    detectUrlChange.on('change', (newUrl) => {
      log.debug(`🔄 URL changed to: ${newUrl}`);
      checkAndLoadButtons();
    });
    
    log.info('Page type monitoring started successfully');
  }

  private static async cleanupButtons(): Promise<void> {
    // Remove floating button
    const floatingBtn = document.getElementById('atlas-xray-floating-btn');
    if (floatingBtn) {
      // Properly unmount React component first
      if (this.floatingButtonRoot) {
        this.floatingButtonRoot.unmount();
        this.floatingButtonRoot = null;
        log.info('🧹 Unmounted React FloatingButton');
      }
      
      floatingBtn.remove();
      log.info('🧹 Cleaned up FloatingButton');
    }

    // Remove dependency button and cleanup service
    const dependencyBtn = document.getElementById('atlas-xray-timeline-btn');
    if (dependencyBtn) {
      dependencyBtn.remove();
      
      // Cleanup TimelineProjectService - now properly awaited
      try {
        const { TimelineProjectService } = await import('./TimelineProjectService');
        TimelineProjectService.cleanupUrlChangeListener();
        TimelineProjectService.clearAllLines();
      } catch (error) {
        log.warn('Could not cleanup TimelineProjectService', String(error));
      }
      
      log.info('🧹 Cleaned up DependencyButton');
    }
  }

  private static async mountFloatingButton(): Promise<void> {
    if (!document.getElementById('atlas-xray-floating-btn')) {
      try {
        const React = await import('react');
        const { createRoot } = await import('react-dom/client');
        const FloatingButton = (await import('../components/FloatingButton/FloatingButton')).default;
        await import('../components/FloatingButton/FloatingButton.scss');
        
        const container = document.createElement('div');
        container.id = 'atlas-xray-floating-btn-container';
        document.body.appendChild(container);
        
        // Store container reference for cleanup
        this.floatingButtonContainer = container;
        
        // Create and store React root for proper cleanup
        this.floatingButtonRoot = createRoot(container);
        this.floatingButtonRoot.render(React.createElement(FloatingButton));
        log.info('FloatingButton mounted successfully');
      } catch (error) {
        log.error('Failed to mount FloatingButton', String(error));
      }
    } else {
      log.info('FloatingButton already exists, skipping mount');
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
      log.info('DependencyButton mounted successfully');
    } else {
      log.info('DependencyButton already exists, skipping mount');
    }
  }
}
