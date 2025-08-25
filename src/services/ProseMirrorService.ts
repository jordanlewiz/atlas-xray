/**
 * ProseMirror Service - Renders Atlassian's ProseMirror JSON content to HTML
 * Critical for displaying project updates and content from Atlassian APIs
 * Follows architecture principles: singleton pattern, clear responsibilities
 */

export interface ProseMirrorNode {
  type: string;
  content?: ProseMirrorNode[];
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}

export interface ProseMirrorDocument {
  content: ProseMirrorNode[];
  [key: string]: any;
}

/**
 * ProseMirror Service for rendering Atlassian content
 * Implements singleton pattern as per architecture principles
 * Critical for displaying project updates and content
 */
export class ProseMirrorService {
  private static instance: ProseMirrorService;
  
  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): ProseMirrorService {
    if (!ProseMirrorService.instance) {
      ProseMirrorService.instance = new ProseMirrorService();
    }
    return ProseMirrorService.instance;
  }

  /**
   * Main renderer function - converts ProseMirror JSON to HTML
   * Critical for displaying Atlassian content in the extension
   */
  renderProseMirror(summary: string | any): string {
    if (!summary) return 'No summary available';
    
    let parsedSummary: any = summary;
    
    // If it's a string, try to parse it as JSON
    if (typeof summary === 'string') {
      if (summary.startsWith('{') && summary.endsWith('}')) {
        try {
          parsedSummary = JSON.parse(summary);
        } catch (error) {
          return summary; // Return as-is if parsing fails
        }
      } else {
        return summary; // Return as-is if not JSON
      }
    }
    
    // If it's a valid ProseMirror document, render it manually
    if (parsedSummary && typeof parsedSummary === 'object' && parsedSummary.content) {
      try {
        const rendered = this.renderProseMirrorManually(parsedSummary);
        return rendered;
      } catch (error) {
        console.error('Error rendering ProseMirror content:', error);
        return `Summary rendering error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    return 'No summary available';
  }

  /**
   * Manual renderer for ProseMirror content
   * Handles all Atlassian-specific node types
   */
  private renderProseMirrorManually(doc: ProseMirrorDocument): string {
    if (!doc.content || !Array.isArray(doc.content)) {
      return 'Invalid document structure';
    }
    
    let html = '';
    
    for (const node of doc.content) {
      html += this.renderNode(node);
    }
    
    return html;
  }

  /**
   * Render individual ProseMirror nodes
   * Supports all Atlassian content types
   */
  private renderNode(node: ProseMirrorNode): string {
    if (!node) return '';
    
    switch (node.type) {
      case 'paragraph':
        return `<p>${this.renderNodeContent(node.content)}</p>`;
      
      case 'text':
        let text = node.text || '';
        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case 'strong':
              case 'bold':
                text = `<strong>${text}</strong>`;
                break;
              case 'em':
              case 'italic':
                text = `<em>${text}</em>`;
                break;
              case 'code':
                text = `<code>${text}</code>`;
                break;
            }
          }
        }
        return text;
      
      case 'emoji':
        return node.attrs?.text || '😊';
      
      case 'bullet_list':
      case 'bulletList':
        return `<ul>${this.renderNodeContent(node.content)}</ul>`;
      
      case 'ordered_list':
      case 'orderedList':
        return `<ol>${this.renderNodeContent(node.content)}</ol>`;
      
      case 'list_item':
      case 'listItem':
        return `<li>${this.renderNodeContent(node.content)}</li>`;
      
      case 'heading':
        const level = node.attrs?.level || 1;
        return `<h${level}>${this.renderNodeContent(node.content)}</h${level}>`;
      
      case 'inlineCard':
        // Handle Confluence inline cards (links)
        const url = node.attrs?.url || '#';
        return `<a href="${url}" target="_blank" style="color: #0052CC; text-decoration: underline;">${url}</a>`;
      
      case 'hardBreak':
        return '<br>';
      
      case 'date':
        // Handle Confluence date nodes
        const timestamp = node.attrs?.timestamp;
        if (timestamp) {
          try {
            const date = new Date(parseInt(timestamp));
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            return `<span class="date-node" style="background-color: #F4F5F7; padding: 2px 4px; border-radius: 3px; font-size: 12px; color: #172B4D;">📅 ${formattedDate}</span>`;
          } catch (error) {
            return `<span class="date-node" style="background-color: #F4F5F7; padding: 2px 4px; border-radius: 3px; font-size: 12px; color: #172B4D;">📅 Date</span>`;
          }
        }
        return `<span class="date-node" style="background-color: #F4F5F7; padding: 2px 4px; border-radius: 3px; font-size: 12px; color: #172B4D;">📅 Date</span>`;
      
      case 'status':
        // Handle Confluence status nodes (colored labels)
        const statusText = node.attrs?.text || 'Status';
        const statusColor = node.attrs?.color || 'neutral';
        const colorMap: Record<string, string> = {
          'blue': '#0052CC',
          'green': '#36B37E', 
          'yellow': '#FFAB00',
          'red': '#DE350B',
          'purple': '#6554C0',
          'neutral': '#6B778C'
        };
        const bgColor = colorMap[statusColor] || colorMap['neutral'];
        return `<span style="background-color: ${bgColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold;">${statusText}</span>`;
      
      case 'mediaSingle':
        // Handle Confluence media containers - render the media content inside
        if (node.content && Array.isArray(node.content)) {
          return `<div class="media-container">${this.renderNodeContent(node.content)}</div>`;
        }
        return '';
      
      case 'media':
        // Handle Confluence media nodes (images, files, etc.)
        const mediaType = node.attrs?.type || 'file';
        const mediaId = node.attrs?.id || '';
        const mediaCollection = node.attrs?.collection || '';
        
        if (mediaType === 'file' && mediaId) {
          // For files, show a link or placeholder
          return `<div class="media-file" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin: 4px 0;">
            <span style="color: #6B778C;">📎 Media file (${mediaId})</span>
          </div>`;
        }
        
        // For images, we'll handle them specially in the component
        if (mediaType === 'image' && mediaId) {
          return `<div class="media-image" data-media-id="${mediaId}" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin: 4px 0;">
            <span style="color: #6B778C;">🖼️ Image (${mediaId})</span>
          </div>`;
        }
        
        return `<div class="media-placeholder" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin: 4px 0; color: #6B778C;">
          📎 Media content
        </div>`;
      
      default:
        // Log unknown node types for debugging
        if (node.type) {
          console.warn(`Unknown ProseMirror node type: ${node.type}`, node);
        }
        // For unknown node types, try to render their content
        if (node.content) {
          return this.renderNodeContent(node.content);
        }
        return '';
    }
  }

  /**
   * Render node content recursively
   */
  private renderNodeContent(content: ProseMirrorNode[]): string {
    if (!content || !Array.isArray(content)) return '';
    
    let html = '';
    for (const node of content) {
      html += this.renderNode(node);
    }
    return html;
  }
}

// Export singleton instance
export const proseMirrorService = ProseMirrorService.getInstance();

// Export main function for backward compatibility
export const renderProseMirror = (content: string | any) => proseMirrorService.renderProseMirror(content);
