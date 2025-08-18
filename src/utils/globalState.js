let cloudId = null;
let sectionId = null;

export function setGlobalCloudAndSection({ newCloudId, newSectionId }) {
  cloudId = newCloudId;
  sectionId = newSectionId;
}

export function getGlobalCloudId() {
  return cloudId;
}

export function getGlobalSectionId() {
  return sectionId;
}
