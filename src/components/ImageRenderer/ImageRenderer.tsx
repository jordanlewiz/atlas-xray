import React, { useState, useEffect } from 'react';
// Image storage not yet implemented - showing placeholder

interface ImageRendererProps {
  projectKey: string;
  mediaId: string;
  fallbackText?: string;
}

/**
 * Component to render stored images from IndexedDB
 */
export default function ImageRenderer({ projectKey, mediaId, fallbackText }: ImageRendererProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Image storage not yet implemented
    // For now, show placeholder immediately
    setLoading(false);
    setError(true);
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
    <div className="image-placeholder" style={{ 
      padding: '16px', 
      border: '2px dashed #ddd', 
      borderRadius: '8px', 
      margin: '8px 0',
      textAlign: 'center',
      color: '#6B778C',
      backgroundColor: '#f8f9fa'
    }}>
      🖼️ Image Storage Coming Soon
      <br />
      <small>Project: {projectKey} | Media: {mediaId}</small>
    </div>
  );
}
