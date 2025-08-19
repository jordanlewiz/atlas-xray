let cloudId: string | null = null;
let sectionId: string | null = null;

interface CloudAndSection {
  newCloudId: string;
  newSectionId: string;
}

export function setGlobalCloudAndSection({ newCloudId, newSectionId }: CloudAndSection): void {
  cloudId = newCloudId;
  sectionId = newSectionId;
}

export function getGlobalCloudId(): string | null {
  return cloudId;
}

export function getGlobalSectionId(): string | null {
  return sectionId;
}
