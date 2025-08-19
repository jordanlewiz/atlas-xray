/**
 * Renders ProseMirror JSON content to HTML string
 */
export function renderProseMirror(summary: string | any): string {
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
      const rendered = renderProseMirrorManually(parsedSummary);
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
 */
function renderProseMirrorManually(doc: any): string {
  if (!doc.content || !Array.isArray(doc.content)) {
    return 'Invalid document structure';
  }
  
  let html = '';
  
  for (const node of doc.content) {
    html += renderNode(node);
  }
  
  return html;
}

function renderNode(node: any): string {
  if (!node) return '';
  
  switch (node.type) {
    case 'paragraph':
      return `<p>${renderNodeContent(node.content)}</p>`;
    
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
      return `<ul>${renderNodeContent(node.content)}</ul>`;
    
    case 'ordered_list':
      return `<ol>${renderNodeContent(node.content)}</ol>`;
    
    case 'list_item':
    case 'listItem':
      return `<li>${renderNodeContent(node.content)}</li>`;
    
    case 'heading':
      const level = node.attrs?.level || 1;
      return `<h${level}>${renderNodeContent(node.content)}</h${level}>`;
    
    case 'inlineCard':
      // Handle Confluence inline cards (links)
      const url = node.attrs?.url || '#';
      return `<a href="${url}" target="_blank" style="color: #0052CC; text-decoration: underline;">${url}</a>`;
    
    case 'hardBreak':
      return '<br>';
    
    default:
      // Log unknown node types for debugging
      if (node.type) {
        console.warn(`Unknown ProseMirror node type: ${node.type}`, node);
      }
      // For unknown node types, try to render their content
      if (node.content) {
        return renderNodeContent(node.content);
      }
      return '';
  }
}

function renderNodeContent(content: any[]): string {
  if (!content || !Array.isArray(content)) return '';
  
  let html = '';
  for (const node of content) {
    html += renderNode(node);
  }
  return html;
}
