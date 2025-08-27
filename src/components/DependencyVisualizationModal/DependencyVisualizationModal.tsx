import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { useLiveQuery } from 'dexie-react-hooks';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';
import { db } from '../../services/DatabaseService';
import './DependencyVisualizationModal.scss';

// Types for our D3 visualization
interface ProjectNode extends d3.SimulationNodeDatum {
  id: string;
  key: string;
  name: string;
  status: string;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface DependencyLink extends d3.SimulationLinkDatum<ProjectNode> {
  id: string;
  source: string | ProjectNode;
  target: string | ProjectNode;
  linkType: 'RELATIONSHIP' | 'DEPENDS_ON' | 'DEPENDED_BY';
  color: string;
  strokeDasharray?: string;
}

// Project status color mapping (matching heatmap colors)
const PROJECT_STATUS_COLORS = {
  'on-track': '#28a745',      // Green
  'on track': '#28a745',
  'off-track': '#dc3545',     // Red
  'off track': '#dc3545',
  'at-risk': '#ffc107',       // Yellow
  'at risk': '#ffc107',
  'paused': '#6f42c1',        // Purple
  'pending': '#17a2b8',       // Blue
  'completed': '#17a2b8',     // Blue
  'done': '#17a2b8',
  'unknown': '#6c757d'        // Gray
} as const;

// Link type styling
const LINK_TYPE_STYLES = {
  'RELATIONSHIP': {
    color: '#6f42c1',         // Purple
    strokeDasharray: '5,5',   // Dashed
    arrow: false
  },
  'DEPENDS_ON': {
    color: '#dc3545',          // Red
    strokeDasharray: 'none',   // Solid
    arrow: true
  },
  'DEPENDED_BY': {
    color: '#17a2b8',          // Teal
    strokeDasharray: 'none',   // Solid
    arrow: true
  }
} as const;

export default function DependencyVisualizationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<ProjectNode, DependencyLink> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load data using live queries
  const projects = useLiveQuery(() => db.getProjectSummaries());
  const projectUpdates = useLiveQuery(() => db.getProjectUpdates());
  const allDependencies = useLiveQuery(() => db.getAllProjectDependencies());

  // Process visualization data
  const visualizationData = useLiveQuery(() => {
    console.log('[DependencyVisualizationModal] 🔍 Data check:', {
      hasProjects: !!projects,
      projectsCount: projects?.length || 0,
      hasDependencies: !!allDependencies,
      dependenciesCount: allDependencies?.length || 0
    });
    
    if (!projects || !allDependencies || allDependencies.length === 0) {
      console.log('[DependencyVisualizationModal] ⚠️ Missing data, returning null');
      return null;
    }

    console.log('[DependencyVisualizationModal] 🚀 Processing data:', {
      projectsCount: projects.length,
      dependenciesCount: allDependencies.length
    });

    // Collect all project keys from dependencies
    const projectKeys = new Set<string>();
    const links: DependencyLink[] = [];

    allDependencies.forEach(dep => {
      projectKeys.add(dep.sourceProjectKey);
      projectKeys.add(dep.targetProjectKey);
      
      // Map link types to our three categories
      let linkType: DependencyLink['linkType'];
      let color: string;
      let strokeDasharray: string | undefined;
      let arrow: boolean;

      switch (dep.linkType) {
        case 'DEPENDS_ON':
          linkType = 'DEPENDS_ON';
          color = LINK_TYPE_STYLES.DEPENDS_ON.color;
          strokeDasharray = LINK_TYPE_STYLES.DEPENDS_ON.strokeDasharray;
          arrow = LINK_TYPE_STYLES.DEPENDS_ON.arrow;
          break;
        case 'BLOCKS':
        case 'IMPLEMENTS':
          linkType = 'DEPENDED_BY';
          color = LINK_TYPE_STYLES.DEPENDED_BY.color;
          strokeDasharray = LINK_TYPE_STYLES.DEPENDED_BY.strokeDasharray;
          arrow = LINK_TYPE_STYLES.DEPENDED_BY.arrow;
          break;
        default:
          linkType = 'RELATIONSHIP';
          color = LINK_TYPE_STYLES.RELATIONSHIP.color;
          strokeDasharray = LINK_TYPE_STYLES.RELATIONSHIP.strokeDasharray;
          arrow = LINK_TYPE_STYLES.RELATIONSHIP.arrow;
      }

      links.push({
        id: dep.id,
        source: dep.sourceProjectKey,
        target: dep.targetProjectKey,
        linkType,
        color,
        strokeDasharray
      });
    });

    // Create nodes for all projects
    const nodes: ProjectNode[] = Array.from(projectKeys).map(key => {
      const project = projects.find(p => p.projectKey === key);
      const status = getProjectStatus(key);
      const color = getProjectStatusColor(status);

      return {
        id: key,
        key,
        name: project?.name || key,
        status,
        color
      };
    });

    return { nodes, links };
  }, [projects, allDependencies, projectUpdates]);

  // Helper functions
  const getProjectStatus = useCallback((projectKey: string): string => {
    if (!projectUpdates) return 'unknown';
    
    const projectUpdate = projectUpdates
      .filter(update => update.projectKey === projectKey)
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0];
    
    return projectUpdate?.state?.toLowerCase() || 'unknown';
  }, [projectUpdates]);

  const getProjectStatusColor = useCallback((status: string): string => {
    return PROJECT_STATUS_COLORS[status as keyof typeof PROJECT_STATUS_COLORS] || PROJECT_STATUS_COLORS.unknown;
  }, []);

  // Monitor when refs become available
  useEffect(() => {
    console.log('[DependencyVisualizationModal] 🔍 Ref monitoring:', {
      svgRef: !!svgRef.current,
      containerRef: !!containerRef.current,
      svgRefType: typeof svgRef.current,
      containerRefType: typeof containerRef.current
    });
  }, [svgRef.current, containerRef.current]);

  // D3 rendering effect - only run when we have BOTH data AND refs
  useEffect(() => {
    console.log('[DependencyVisualizationModal] 🔄 useEffect triggered:', {
      hasSvgRef: !!svgRef.current,
      hasVisualizationData: !!visualizationData,
      hasContainerRef: !!containerRef.current,
      dataReady: !!visualizationData?.nodes?.length,
      svgRefType: typeof svgRef.current,
      containerRefType: typeof containerRef.current
    });
    
    // Only proceed if we have ALL required pieces
    if (!svgRef.current || !containerRef.current || !visualizationData?.nodes?.length) {
      console.log('[DependencyVisualizationModal] ⚠️ Missing required pieces, skipping D3 render');
      console.log('[DependencyVisualizationModal] 🔍 Ref status:', {
        svgRef: svgRef.current,
        containerRef: containerRef.current,
        svgRefType: typeof svgRef.current,
        containerRefType: typeof containerRef.current
      });
      return;
    }
    
    console.log('[DependencyVisualizationModal] 🎨 All pieces ready, starting D3 render');
    renderD3Visualization();
  }, [visualizationData, svgRef.current, containerRef.current]);

  // Separate function for D3 rendering
  const renderD3Visualization = useCallback(() => {
    if (!svgRef.current || !visualizationData || !containerRef.current) {
      console.log('[DependencyVisualizationModal] ⚠️ Missing refs or data in render function');
      return;
    }
    
    setIsLoading(false);
    console.log('[DependencyVisualizationModal] 🎨 Rendering D3 visualization');
    
    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);
    
    // Clear existing content
    svg.selectAll('*').remove();
    
    const { nodes, links } = visualizationData;
    
    console.log('[DependencyVisualizationModal] 📊 Visualization data:', { 
      nodesCount: nodes.length, 
      linksCount: links.length,
      sampleNode: nodes[0],
      sampleLink: links[0]
    });
    
    // Ensure we have data to visualize
    if (nodes.length === 0) {
      console.log('[DependencyVisualizationModal] ⚠️ No nodes to visualize');
      return;
    }
    
    // Get container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    let width = containerRect.width;
    let height = containerRect.height;
    
    console.log('[DependencyVisualizationModal] 📐 Raw container dimensions:', { width, height });
    
    // Fallback dimensions if container is not yet sized
    if (width === 0 || height === 0) {
      width = 1000;
      height = 600;
      console.log('[DependencyVisualizationModal] ⚠️ Container not sized, using fallback dimensions:', { width, height });
    }
    
    console.log('[DependencyVisualizationModal] 📏 Container dimensions:', { width, height });
    
    // Set up SVG dimensions
    svg.attr('width', width).attr('height', height);
    
    console.log('[DependencyVisualizationModal] 🎯 SVG dimensions set:', { width, height });
    
    console.log('[DependencyVisualizationModal] 🎯 SVG created with dimensions:', { width, height });
    
    // Create arrow markers for directional links
    const defs = svg.append('defs');
    
    // Arrow marker for DEPENDS_ON (red)
    defs.append('marker')
      .attr('id', 'arrow-depends-on')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', LINK_TYPE_STYLES.DEPENDS_ON.color);
    
    // Arrow marker for DEPENDED_BY (teal) - at end of line
    defs.append('marker')
      .attr('id', 'arrow-depended-by')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', LINK_TYPE_STYLES.DEPENDED_BY.color);
    
    // Arrow marker for DEPENDED_BY (teal) - at start of line
    defs.append('marker')
      .attr('id', 'arrow-depended-by-start')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', -15)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', LINK_TYPE_STYLES.DEPENDED_BY.color);
    
    // Set up force simulation
    const sim = d3.forceSimulation<ProjectNode>(nodes)
      .force('link', d3.forceLink<ProjectNode, DependencyLink>(links).id(d => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(100));

    setSimulation(sim);

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.strokeDasharray || 'none')
      .attr('marker-end', d => {
        if (d.linkType === 'DEPENDS_ON') return 'url(#arrow-depends-on)';
        if (d.linkType === 'DEPENDED_BY') return 'url(#arrow-depended-by)';
        return 'none';
      })
      .attr('marker-start', d => {
        // For DEPENDED_BY, show arrow at start to indicate direction
        if (d.linkType === 'DEPENDED_BY') return 'url(#arrow-depended-by-start)';
        return 'none';
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 4);
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'dependency-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.9)')
          .style('color', 'white')
          .style('padding', '10px')
          .style('border-radius', '6px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('max-width', '250px');
        
        const sourceNode = nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : d.source.id));
        const targetNode = nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target.id));
        
        tooltip.html(`
          <strong>${d.linkType.replace('_', ' ')}</strong><br/>
          <strong>From:</strong> ${sourceNode?.name || sourceNode?.key}<br/>
          <strong>To:</strong> ${targetNode?.name || targetNode?.key}
        `);
        
        tooltip.html(`
          <strong>${d.linkType.replace('_', ' ')}</strong><br/>
          <strong>From:</strong> ${sourceNode?.name || sourceNode?.key}<br/>
          <strong>To:</strong> ${targetNode?.name || targetNode?.key}
        `);
        
        tooltip.style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 2);
        d3.selectAll('.dependency-tooltip').remove();
      });

    // Create project nodes as rectangles (cards)
    const node = svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .enter().append('rect')
      .attr('width', 120)
      .attr('height', 80)
      .attr('rx', 8)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag<SVGRectElement, ProjectNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add project ID labels
    const idLabel = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.key)
      .attr('text-anchor', 'middle')
      .attr('x', 60)
      .attr('y', 25)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff');

    // Add project title labels
    const titleLabel = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name)
      .attr('text-anchor', 'middle')
      .attr('x', 60)
      .attr('y', 45)
      .attr('font-size', '10px')
      .attr('fill', '#fff');

    // Add status labels
    const statusLabel = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: ProjectNode) => d.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
      .attr('text-anchor', 'middle')
      .attr('x', 60)
      .attr('y', 65)
      .attr('font-size', '9px')
      .attr('fill', '#fff')
      .attr('opacity', 0.8);

    // Node tooltips
    node.on('mouseover', function(event: any, d: ProjectNode) {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'node-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.95)')
        .style('color', 'white')
        .style('padding', '12px')
        .style('border-radius', '8px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('max-width', '250px')
        .style('border', `2px solid ${d.color}`);
      
      tooltip.html(`
        <strong>Project ID:</strong> ${d.key}<br/>
        <strong>Title:</strong> ${d.name}<br/>
        <strong>Status:</strong> ${d.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      `);
      
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      d3.selectAll('.node-tooltip').remove();
    });

    // Update positions on simulation tick
    sim.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as any).x)
        .attr('y1', (d: any) => (d.source as any).y)
        .attr('x2', (d: any) => (d.target as any).x)
        .attr('y2', (d: any) => (d.target as any).y);

      node
        .attr('x', (d: ProjectNode) => (d.x || 0) - 60)
        .attr('y', (d: ProjectNode) => (d.y || 0) - 40);

      idLabel
        .attr('x', (d: ProjectNode) => (d.x || 0))
        .attr('y', (d: ProjectNode) => (d.y || 0) - 15);

      titleLabel
        .attr('x', (d: ProjectNode) => (d.x || 0))
        .attr('y', (d: ProjectNode) => (d.y || 0) + 5);

      statusLabel
        .attr('x', (d: ProjectNode) => (d.x || 0))
        .attr('y', (d: ProjectNode) => (d.y || 0) + 25);
      
      // Log node positions for debugging (console only)
      if (nodes.length > 0) {
        console.log('[DependencyVisualizationModal] 📍 First 3 node positions:', 
          nodes.slice(0, 3).map(n => ({ 
            key: n.key, 
            x: n.x, 
            y: n.y,
            svgX: (n.x || 0) - 60,
            svgY: (n.y || 0) - 40
          }))
        );
      }
    });

    // Set up zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        const { transform } = event;
        setZoomLevel(transform.k);
        svg.selectAll('g').attr('transform', transform);
      });

    svg.call(zoom);

    console.log('[DependencyVisualizationModal] ✅ D3 visualization created successfully');
    
    // Cleanup
    return () => {
      sim.stop();
    };
  }, [visualizationData, svgRef.current, containerRef.current]);

  // Drag functions
  const dragstarted = (event: any, d: ProjectNode) => {
    if (!simulation) return;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = (event: any, d: ProjectNode) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  const dragended = (event: any, d: ProjectNode) => {
    if (!simulation) return;
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };

  // Create sample data for testing
  const createSampleData = useCallback(async () => {
    try {
      console.log('[DependencyVisualizationModal] 🧪 Creating sample dependency data...');
      
      // Create sample dependencies
      const sampleDependencies = [
        {
          id: 'sample-1',
          sourceProjectKey: 'PROJ-001',
          targetProjectKey: 'PROJ-002',
          linkType: 'DEPENDS_ON',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'sample-2',
          sourceProjectKey: 'PROJ-002',
          targetProjectKey: 'PROJ-003',
          linkType: 'BLOCKS',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'sample-3',
          sourceProjectKey: 'PROJ-001',
          targetProjectKey: 'PROJ-003',
          linkType: 'RELATED',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      ];

      // Store sample dependencies
      for (const dep of sampleDependencies) {
        await db.storeProjectDependencies(dep.sourceProjectKey, [dep]);
      }

      console.log('[DependencyVisualizationModal] ✅ Sample data created successfully');
      
      // Force a refresh of the live query
      window.location.reload();
      
    } catch (error) {
      console.error('[DependencyVisualizationModal] ❌ Failed to create sample data:', error);
    }
  }, []);

  // Reset zoom and pan
  const resetView = useCallback(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
      );
      setZoomLevel(1);
    }
  }, []);



  return (
    <ModalTransition>
      {isOpen && (
        <Modal
          onClose={onClose}
          width="x-large"
        >
          <ModalHeader hasCloseButton>
            <ModalTitle>Project Dependency Visualiser</ModalTitle>
          </ModalHeader>
          
          <ModalBody>
            <div className="dependency-visualization-content">
              {/* Controls */}
              <div className="controls">
                <Button appearance="primary" onClick={resetView}>
                  Reset View
                </Button>
                <div className="zoom-info">
                  Zoom: {Math.round(zoomLevel * 100)}%
                </div>
              </div>



              {/* Visualization Container */}
              {!visualizationData ? (
                <div className="loading">
                  {isLoading ? 'Loading dependencies...' : 'No dependencies found'}
                </div>
              ) : visualizationData.nodes.length === 0 ? (
                <div className="loading">
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <h3 style={{ color: '#6b778c', marginBottom: '16px' }}>No Dependencies Found</h3>
                    <p style={{ color: '#6b778c', marginBottom: '24px' }}>
                      There are currently no project dependencies in your database.
                    </p>
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                      <h4 style={{ color: '#42526e', marginBottom: '12px' }}>To see the visualization:</h4>
                      <ul style={{ color: '#6b778c', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                        <li>Ensure projects have dependencies defined in your system</li>
                        <li>Check that dependency data has been imported</li>
                        <li>Verify your database connection is working</li>
                      </ul>
                      <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Button 
                          appearance="primary" 
                          onClick={createSampleData}
                          style={{ marginRight: '12px' }}
                        >
                          Create Sample Data
                        </Button>
                        <Button 
                          appearance="subtle" 
                          onClick={() => window.open('https://github.com/your-repo/docs#dependencies', '_blank')}
                        >
                          View Documentation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="visualization-container" ref={containerRef} style={{ height: '600px', width: '100%' }}>
                                      <svg
                      ref={svgRef}
                      className="dependency-svg"
                      style={{ 
                        display: 'block',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                </div>
              )}

              {/* Legend */}
              <div className="legend">
                <h3>Project Status Colors</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: PROJECT_STATUS_COLORS['on-track'] }}></span>
                    <span>On Track</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: PROJECT_STATUS_COLORS['off-track'] }}></span>
                    <span>Off Track</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: PROJECT_STATUS_COLORS['at-risk'] }}></span>
                    <span>At Risk</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: PROJECT_STATUS_COLORS['paused'] }}></span>
                    <span>Paused</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: PROJECT_STATUS_COLORS['pending'] }}></span>
                    <span>Pending</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: PROJECT_STATUS_COLORS['completed'] }}></span>
                    <span>Completed</span>
                  </div>
                </div>

                <h3>Dependency Types</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: LINK_TYPE_STYLES.RELATIONSHIP.color }}></span>
                    <span>Relationship (dashed purple)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: LINK_TYPE_STYLES.DEPENDS_ON.color }}></span>
                    <span>Depends On (red arrow)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: LINK_TYPE_STYLES.DEPENDED_BY.color }}></span>
                    <span>Depended By (teal arrow)</span>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          
          <ModalFooter>
            <Button appearance="subtle" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
}
