import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/DatabaseService';
// TODO: Update to use new dependency service when implemented
import './DependencyVisualizationModal.scss';

interface ProjectNode extends d3.SimulationNodeDatum {
  id: string;
  key: string;
  name: string;
  status: string;
  color: string;
  dependencies: number;
  dependents: number;
}

interface DependencyLink extends d3.SimulationLinkDatum<ProjectNode> {
  id: string;
  source: string;
  target: string;
  linkType: string;
  color: string;
}

export default function DependencyVisualizationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<ProjectNode, DependencyLink> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [stats, setStats] = useState({ totalProjects: 0, totalDependencies: 0, uniqueLinkTypes: 0 });

  // TODO: Implement dependency fetching with new service
  const projects = useLiveQuery(() => db.getProjectViews());
  const projectUpdates = useLiveQuery(() => db.getProjectUpdates());
  
  // TODO: Implement dependency fetching with new service
  const [allDependencies, setAllDependencies] = useState<Map<string, any[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get project status color
  const getProjectStatusColor = (projectKey: string): string => {
    if (!projectUpdates) return '#6c757d'; // Default gray
    
    const projectUpdate = projectUpdates
      .filter(update => update.projectKey === projectKey)
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0];
    
    if (!projectUpdate) return '#6c757d';
    
    const status = projectUpdate.state?.toLowerCase() || 'unknown';
    
    // Map status to colors (matching the timeline colors)
    switch (status) {
      case 'on-track':
      case 'on track':
        return '#28a745'; // Green
      case 'off-track':
      case 'off track':
        return '#dc3545'; // Red
      case 'at-risk':
      case 'at risk':
        return '#ffc107'; // Yellow
      case 'completed':
        return '#17a2b8'; // Blue
      default:
        return '#6c757d'; // Gray
    }
  };

  // Helper function to get project status text
  const getProjectStatusText = (projectKey: string): string => {
    if (!projectUpdates) return 'Unknown';
    
    const projectUpdate = projectUpdates
      .filter(update => update.projectKey === projectKey)
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0];
    
    return projectUpdate?.state || 'Unknown';
  };

  // Create D3 visualization
  useEffect(() => {
    if (!svgRef.current || !projects || allDependencies.size === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear existing content

    // Prepare data for D3
    const projectKeys = new Set<string>();
    const links: DependencyLink[] = [];
    const linkTypes = new Set<string>();

    // Collect all project keys and links
    allDependencies.forEach((dependencies, sourceKey) => {
      projectKeys.add(sourceKey);
      
      dependencies.forEach(dep => {
        projectKeys.add(dep.targetProject.key);
        linkTypes.add(dep.linkType);
        
        links.push({
          id: dep.id,
          source: sourceKey,
          target: dep.targetProject.key,
          linkType: dep.linkType,
          color: getLinkTypeColor(dep.linkType)
        });
      });
    });

    // Create nodes
    const nodes: ProjectNode[] = Array.from(projectKeys).map(key => {
      const project = projects.find(p => p.projectKey === key);
      const dependencies = allDependencies.get(key) || [];
      const dependents = Array.from(allDependencies.values())
        .flat()
        .filter(dep => dep.targetProject.key === key);

      return {
        id: key,
        key,
        name: project?.projectKey || key,
        status: getProjectStatusText(key),
        color: getProjectStatusColor(key),
        dependencies: dependencies.length,
        dependents: dependents.length
      };
    });

    // Update stats
    setStats({
      totalProjects: nodes.length,
      totalDependencies: links.length,
      uniqueLinkTypes: linkTypes.size
    });

    // Set up D3 force simulation
    const sim = d3.forceSimulation<ProjectNode>(nodes)
      .force('link', d3.forceLink<ProjectNode, DependencyLink>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
      .force('collide', d3.forceCollide().radius(50));

    setSimulation(sim);

    // Create arrow marker for links
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 4);
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'dependency-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000');
        
        tooltip.html(`
          <strong>Link Type:</strong> ${d.linkType}<br/>
          <strong>From:</strong> ${d.source}<br/>
          <strong>To:</strong> ${d.target}
        `);
        
        tooltip.style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 2);
        d3.selectAll('.dependency-tooltip').remove();
      });

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d: ProjectNode) => Math.max(20, Math.min(40, 20 + (d.dependencies + d.dependents) * 2)))
      .attr('fill', (d: ProjectNode) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag<SVGCircleElement, ProjectNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add labels to nodes
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: ProjectNode) => d.key)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold');

    // Add dependency counts to nodes
    const countLabel = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: ProjectNode) => `${d.dependencies}→ ${d.dependents}←`)
      .attr('text-anchor', 'middle')
      .attr('dy', '2.5em')
      .attr('font-size', '10px')
      .attr('fill', '#666');

    // Node tooltips
    node.on('mouseover', function(event: any, d: ProjectNode) {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'node-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('max-width', '200px');
      
      tooltip.html(`
        <strong>Project:</strong> ${d.key}<br/>
        <strong>Status:</strong> ${d.status}<br/>
        <strong>Dependencies:</strong> ${d.dependencies}<br/>
        <strong>Dependents:</strong> ${d.dependents}
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
        .attr('cx', (d: ProjectNode) => d.x!)
        .attr('cy', (d: ProjectNode) => d.y!);

      label
        .attr('x', (d: ProjectNode) => d.x!)
        .attr('y', (d: ProjectNode) => d.y!);

      countLabel
        .attr('x', (d: ProjectNode) => d.x!)
        .attr('y', (d: ProjectNode) => d.y!);
    });

    // Drag functions
    function dragstarted(event: any, d: ProjectNode) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: ProjectNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: ProjectNode) {
      if (!event.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Set up zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .on('zoom', (event) => {
        const { transform } = event;
        setZoomLevel(transform.k);
        svg.selectAll('g').attr('transform', transform);
      });

    svg.call(zoom);

    // Cleanup
    return () => {
      sim.stop();
    };
  }, [projects, allDependencies, projectUpdates]);

  // Helper function to get link type colors
  const getLinkTypeColor = (linkType: string): string => {
    switch (linkType) {
      case 'DEPENDS_ON':
        return '#dc3545'; // Red
      case 'RELATED':
        return '#17a2b8'; // Blue
      case 'BLOCKS':
        return '#ffc107'; // Yellow
      case 'IMPLEMENTS':
        return '#28a745'; // Green
      default:
        return '#6c757d'; // Gray
    }
  };

  // Reset zoom and pan
  const resetView = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
      );
      setZoomLevel(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dependency-visualization-modal">
      <div className="modal-header">
        <h2>Project Dependencies Visualization</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="modal-content">
        <div className="controls">
          <button onClick={resetView} className="reset-button">
            Reset View
          </button>
          <div className="zoom-info">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Projects:</span>
            <span className="stat-value">{stats.totalProjects}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dependencies:</span>
            <span className="stat-value">{stats.totalDependencies}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Link Types:</span>
            <span className="stat-value">{stats.uniqueLinkTypes}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading dependencies...</div>
        ) : (
          <div className="visualization-container">
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              className="dependency-svg"
            />
          </div>
        )}

        <div className="legend">
          <h3>Status Colors</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
              <span>On Track</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#dc3545' }}></span>
              <span>Off Track</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
              <span>At Risk</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#17a2b8' }}></span>
              <span>Completed</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#6c757d' }}></span>
              <span>Unknown</span>
            </div>
          </div>

          <h3>Link Types</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#dc3545' }}></span>
              <span>DEPENDS_ON</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#17a2b8' }}></span>
              <span>RELATED</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
              <span>BLOCKS</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
              <span>IMPLEMENTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
