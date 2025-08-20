/**
 * Fetch image from blob URL and convert to base64 for storage
 * @param blobUrl - Blob URL from Atlassian
 * @returns Promise<{imageData: string, mimeType: string} | null>
 */
export async function fetchImageFromBlobUrl(blobUrl: string): Promise<{imageData: string, mimeType: string} | null> {
  try {
    // Fetch the blob data
    const response = await fetch(blobUrl);
    if (!response.ok) {
      console.warn('[AtlasXray] Failed to fetch image from blob URL:', response.statusText);
      return null;
    }

    const blob = await response.blob();
    const mimeType = blob.type || 'image/png';
    
    // Convert blob to base64
    const imageData = await blobToBase64(blob);
    
    return { imageData, mimeType };
  } catch (error) {
    console.error('[AtlasXray] Error fetching image from blob URL:', error);
    return null;
  }
}

/**
 * Convert blob to base64 string
 * @param blob - Blob object
 * @returns Promise<string>
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix to get just the base64 data
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert base64 data back to data URL for display
 * @param imageData - Base64 encoded image data
 * @param mimeType - MIME type of the image
 * @returns string - Data URL
 */
export function base64ToDataUrl(imageData: string, mimeType: string): string {
  return `data:${mimeType};base64,${imageData}`;
}
