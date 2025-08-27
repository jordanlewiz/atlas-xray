# Dependency Visualization Modal

A D3.js-powered interactive visualization component for displaying project dependencies in a force-directed graph.

## Features

- **Square Card Nodes**: Each project is represented as a rectangular card showing:
  - Project ID (top, bold)
  - Project Title (middle, truncated if >15 chars)
  - Current Status (bottom, formatted)
- **Three Connector Types**:
  - **Relationship**: Dashed purple lines (no arrows)
  - **Depends On**: Solid red lines with red arrows
  - **Depended By**: Solid teal lines with teal arrows
- **Project Status Colors**: Matching your heatmap colors
- **Interactive Features**: Drag & drop, zoom & pan, tooltips
- **Responsive Design**: Works on different screen sizes
- **Dark Mode Support**: Automatically adapts to system theme

## Usage

```tsx
import DependencyVisualizationModal from './DependencyVisualizationModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <DependencyVisualizationModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
    />
  );
}
```

## Data Requirements

The component expects the following data structure:

### Projects
```typescript
interface ProjectSummary {
  projectKey: string;
  name?: string;
  status?: string;
  // ... other fields
}
```

### Dependencies
```typescript
interface ProjectDependency {
  id: string;
  sourceProjectKey: string;
  targetProjectKey: string;
  linkType: 'DEPENDS_ON' | 'BLOCKS' | 'IMPLEMENTS' | 'RELATED';
  createdAt: string;
  lastUpdated: string;
}
```

## Troubleshooting

### No Visualization Appearing

If you see a blank white area instead of the D3 visualization:

1. **Check Console Logs**: Look for debugging messages starting with `[DependencyVisualizationModal]`
2. **Verify Data**: Ensure you have both projects and dependencies in your database
3. **Use Sample Data**: Click the "Create Sample Data" button to generate test data
4. **Check Database**: Verify your IndexedDB connection is working

### Common Issues

#### Empty Visualization
- **Cause**: No dependency data in database
- **Solution**: Import dependencies or use sample data button

#### Container Not Sized
- **Cause**: Modal container dimensions are 0
- **Solution**: Component automatically uses fallback dimensions (800x600)

#### D3 Not Rendering
- **Cause**: JavaScript errors or missing D3 library
- **Solution**: Check browser console for errors, ensure D3 is loaded

## Testing

Run the test suite:

```bash
npm test -- src/components/DependencyVisualizationModal/DependencyVisualizationModal.test.tsx
```

## Dependencies

- **D3.js**: v7.9.0+ for visualization
- **React**: 18+ for component lifecycle
- **Dexie**: For database queries
- **Atlassian UI**: For modal components

## Styling

The component uses SCSS with:
- Responsive grid layouts
- Hover effects and transitions
- Dark mode support
- Consistent spacing and typography

## Performance

- Uses live queries for real-time updates
- D3 force simulation with optimized forces
- Efficient SVG rendering
- Debounced zoom and pan operations

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

To modify the visualization:

1. **Add New Link Types**: Update `LINK_TYPE_STYLES` constant
2. **Change Node Appearance**: Modify the D3 node creation code
3. **Adjust Forces**: Tune the force simulation parameters
4. **Add Interactions**: Extend the event handlers

## License

Part of the Atlas Xray extension project.
