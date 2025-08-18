import { getGlobalCloudId, getGlobalSectionId } from "./globalState";

export function buildProjectUrlFromKey(projectKey) {
  const cloudId = getGlobalCloudId();
  const sectionId = getGlobalSectionId();
  if (!cloudId || !sectionId || !projectKey) return undefined;
  return `https://home.atlassian.com/o/${cloudId}/s/${sectionId}/project/${projectKey}/updates`;
}
