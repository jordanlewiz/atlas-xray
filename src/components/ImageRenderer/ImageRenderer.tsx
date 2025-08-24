import React, { useState, useEffect } from 'react';
import { getProjectImage } from '../../services/DatabaseService';
// Simple utility to convert base64 to data URL
const base64ToDataUrl = (base64: string, mimeType: string): string => {
  return `data:${mimeType};base64,${base64}`;
};

interface ImageRendererProps {
  projectKey: string;
  mediaId: string;
  fallbackText?: string;
}

/**
 * Component to render stored images from IndexedDB
 */
export default function ImageRenderer({ projectKey, mediaId, fallbackText }: ImageRendererProps): React.JSX.Element {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadImage() {
      try {
        setLoading(true);
        const imageData = await getProjectImage(projectKey, mediaId);
        
        if (imageData) {
          const dataUrl = base64ToDataUrl(imageData.imageData, imageData.mimeType);
          setImageUrl(dataUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('[AtlasXray] Error loading image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (projectKey && mediaId) {
      loadImage();
    }
  }, [projectKey, mediaId]);

  if (loading) {
    return (
      <div className="image-loading" style={{ padding: '8px', color: '#6B778C', fontStyle: 'italic' }}>
        Loading image...
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="image-error" style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', margin: '4px 0', color: '#6B778C' }}>
        {fallbackText || `🖼️ Image (${mediaId})`}
      </div>
    );
  }

  return (
    <div className="stored-image" style={{ margin: '8px 0' }}>
      <img 
        src={imageUrl} 
        alt={`Project update image ${mediaId}`}
        style={{ 
          maxWidth: '100%', 
          height: 'auto', 
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}
        onError={() => setError(true)}
      />
    </div>
  );
}
