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
    const checkAndAlert = () => {
      const pageType = this.detectPageType();
      alert(`🚀 Atlas Xray: ${pageType}\n\nURL: ${window.location.href}`);
    };
    
    checkAndAlert(); // Initial check
    window.addEventListener('popstate', checkAndAlert);
    window.addEventListener('hashchange', checkAndAlert);
    
    // SPA navigation detection
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        checkAndAlert();
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
}
