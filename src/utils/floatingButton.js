// Inject a floating button to indicate the extension has loaded
import { setItem, getItem } from "./dexieDB";
(function() {
  // Floating button code
  var button = document.createElement('button');
  button.innerText = 'Atlas Xray Loaded';
  button.style.position = 'fixed';
  button.style.top = '20px';
  button.style.right = '20px';
  button.style.zIndex = '9999';
  button.style.padding = '10px 18px';
  button.style.background = '#0052cc';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '6px';
  button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  button.style.fontFamily = 'inherit';
  document.body.appendChild(button);

  // Regex for /o/{projectId}/s/{sectionId}/project/{ORG-123}
  var projectLinkPattern = /\/o\/([a-f0-9\-]+)\/s\/([a-f0-9\-]+)\/project\/([A-Z]+-\d+)/;

  async function saveProjectIdIfNew(projectId) {
    // Use a key like 'projectId:MYOB-660' to avoid duplicates
    const key = `projectId:${projectId}`;
    const existing = await getItem(key);
    if (!existing) {
      await setItem(key, projectId);
      console.log('Saved project ID to IndexedDB:', projectId);
    }
  }

  function findMatchingProjectLinks() {
    var links = Array.from(document.querySelectorAll('a[href]'));
    var matches = links.filter(link => projectLinkPattern.test(link.getAttribute('href')));
    matches.forEach(link => {
      var match = link.getAttribute('href').match(projectLinkPattern);
      if (match && match[3]) {
        const projectId = match[3];
        console.log(projectId); // Only log the project ID (e.g., MYOB-660)
        saveProjectIdIfNew(projectId);
      }
    });
    return matches;
  }

  // Initial scan
  findMatchingProjectLinks();

  // Watch for page changes (SPA navigation)
  var observer = new MutationObserver(() => {
    findMatchingProjectLinks();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
