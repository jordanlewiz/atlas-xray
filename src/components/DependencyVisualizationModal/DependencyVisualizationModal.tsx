import React, { useEffect, useRef, useState } from 'react';
import ModalDialog from "@atlaskit/modal-dialog";
import {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@atlaskit/modal-dialog";
import { Box } from "@atlaskit/primitives";
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/DatabaseService';
import * as d3 from 'd3';

interface DependencyVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  projectKey: string;
  group: number;
}

interface DependencyLink extends d3.SimulationLinkDatum<ProjectNode> {
  source: string;
  target: string;
  value: number;
}

/**
 * Modal for visualizing project dependencies as a network graph
 */
export default function DependencyVisualizationModal({ 
  isOpen, 
  onClose 
}: DependencyVisualizationModalProps): React.JSX.Element | null {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  
  // Fetch all projects and dependencies
  const projects = useLiveQuery(() => db.getProjectViews());
  const allDependencies = useLiveQuery(() => db.getAllProjectDependencies());
  
  // NEW: Fetch project updates to get status colors
  const projectUpdates = useLiveQuery(() => db.getProjectUpdates());

  useEffect(() => {
    if (!isOpen || !projects || !allDependencies || !projectUpdates || !svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Prepare data for D3
    const nodes: ProjectNode[] = projects.map(project => ({
      id: project.projectKey,
      name: project.name || project.projectKey,
      projectKey: project.projectKey,
      group: 1
    }));

    const links: DependencyLink[] = allDependencies.map(dep => ({
      source: dep.sourceProjectKey,
      target: dep.targetProjectKey,
      value: 1
    }));

    // Create unique nodes (some might be targets but not in projects list)
    const allNodeIds = new Set([
      ...nodes.map(n => n.id),
      ...links.map(l => l.source),
      ...links.map(l => l.target)
    ]);

    allNodeIds.forEach(id => {
      if (!nodes.find(n => n.id === id)) {
        nodes.push({
          id,
          name: id,
          projectKey: id,
          group: 2
        });
      }
    });

    // Helper function to get most recent status for a project
    const getProjectStatusColor = (projectKey: string): string => {
      const projectUpdatesList = projectUpdates.filter(update => update.projectKey === projectKey);
      if (projectUpdatesList.length === 0) return "#96CEB4"; // Default green for no status
      
      // Get the most recent update (by creation date)
      const mostRecentUpdate = projectUpdatesList.reduce((latest, current) => {
        const latestDate = new Date(latest.creationDate);
        const currentDate = new Date(current.creationDate);
        return currentDate > latestDate ? current : latest;
      });
      
      // Return color based on status
      if (!mostRecentUpdate.state) return "#96CEB4"; // No status
      
      const status = mostRecentUpdate.state.toLowerCase().replace(/_/g, '-');
      switch (status) {
        case 'on-track': return "#4CAF50"; // Green
        case 'off-track': return "#F44336"; // Red
        case 'at-risk': return "#FF9800"; // Orange
        case 'pending': return "#2196F3"; // Blue
        case 'paused': return "#9E9E9E"; // Grey
        case 'cancelled': return "#424242"; // Dark Grey
        case 'done': return "#006400"; // Dark Green
        case 'none': return "#FFFFFF"; // White
        default: return "#96CEB4"; // Default green
      }
    };

    // Helper function to get status text for a project
    const getProjectStatusText = (projectKey: string): string => {
      const projectUpdatesList = projectUpdates.filter(update => update.projectKey === projectKey);
      if (projectUpdatesList.length === 0) return "No Status";
      
      // Get the most recent update (by creation date)
      const mostRecentUpdate = projectUpdatesList.reduce((latest, current) => {
        const latestDate = new Date(latest.creationDate);
        const currentDate = new Date(current.creationDate);
        return currentDate > latestDate ? current : latest;
      });
      
      return mostRecentUpdate.state || "No Status";
    };

    // Create SVG container with zoom
    const svg = d3.select(svgRef.current);
    const g = svg.append("g");
    
    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom as any);
    
    // Create arrow marker for links
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#666");

    // Create D3 force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide().radius(35));

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .on("mouseover", function() {
        d3.select(this).attr("stroke-width", 4).attr("stroke", "#0052CC");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 2).attr("stroke", "#999");
      });

    // Create nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<any, ProjectNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles to nodes with STATUS-BASED coloring
    node.append("circle")
      .attr("r", 25)
      .attr("fill", (d: ProjectNode) => getProjectStatusColor(d.id))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke-width", 4).attr("stroke", "#0052CC");
        
        // Highlight connected links
        link.attr("stroke-opacity", l => 
          (l.source === d.id || l.target === d.id) ? 1 : 0.1
        );
        
        // Show tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "node-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "6px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");
        
        const status = getProjectStatusText(d.id);
        const dependencies = allDependencies.filter(dep => dep.sourceProjectKey === d.id);
        const dependents = allDependencies.filter(dep => dep.targetProjectKey === d.id);
        
        let tooltipContent = `<strong>${d.projectKey}</strong><br/>`;
        tooltipContent += `<strong>Status:</strong> ${status}<br/>`;
        if (dependencies.length > 0) {
          tooltipContent += `<strong>Depends on:</strong> ${dependencies.length} project(s)<br/>`;
        }
        if (dependents.length > 0) {
          tooltipContent += `<strong>Required by:</strong> ${dependents.length} project(s)`;
        }
        
        tooltip.html(tooltipContent);
        
        // Position tooltip
        const [mouseX, mouseY] = d3.pointer(event);
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 2).attr("stroke", "#fff");
        link.attr("stroke-opacity", 0.7);
        
        // Remove tooltip
        d3.selectAll(".node-tooltip").remove();
      });

    // Add labels to nodes
    node.append("text")
      .text((d: ProjectNode) => d.projectKey)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "11px")
      .attr("fill", "white")
      .attr("font-weight", "bold");

    // Add project names below
    node.append("text")
      .text((d: ProjectNode) => d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name)
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .attr("font-size", "9px")
      .attr("fill", "#333")
      .attr("font-weight", "500");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [isOpen, projects, allDependencies, projectUpdates, dimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(window.innerWidth - 100, 1200),
        height: Math.min(window.innerHeight - 200, 800)
      });
    };

    if (isOpen) {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalTransition>
      <ModalDialog
        onClose={onClose}
        width="full"
        shouldScrollInViewport
      >
        <ModalHeader>
          <ModalTitle>Project Dependencies Visualization</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Box style={{ width: '100%', height: '100%' }}>
            <div className="dependency-visualization-container">
              <div className="visualization-info">
                <p>
                  <strong>🟢 Green nodes:</strong> Projects "On Track" | 
                  <strong> 🔴 Red nodes:</strong> Projects "Off Track" | 
                  <strong> 🟠 Orange nodes:</strong> Projects "At Risk" | 
                  <strong> 🔵 Blue nodes:</strong> Projects "Pending"
                </p>
                <p>
                  <strong>⚪ White nodes:</strong> Projects "No Status" | 
                  <strong> ⚫ Grey nodes:</strong> Projects "Paused" | 
                  <strong> 🟤 Dark nodes:</strong> Projects "Cancelled" | 
                  <strong> 🟢 Dark Green nodes:</strong> Projects "Done"
                </p>
                <p>
                  <strong>↗️ Arrows:</strong> Show dependency direction (from dependent to dependency)
                </p>
                <p>
                  <em>Drag nodes to rearrange • Scroll to zoom • Hover for details • Click and drag to pan</em>
                </p>
              </div>
              
              {/* Status Legend */}
              <div className="status-legend">
                <h4>Status Color Legend</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
                    <span>On Track</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
                    <span>Off Track</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
                    <span>At Risk</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
                    <span>Pending</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#9E9E9E' }}></span>
                    <span>Paused</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#424242' }}></span>
                    <span>Cancelled</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#006400' }}></span>
                    <span>Done</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FFFFFF', border: '1px solid #ddd' }}></span>
                    <span>No Status</span>
                  </div>
                </div>
              </div>
              
              <div className="visualization-canvas">
                <div className="canvas-controls">
                  <button 
                    className="reset-zoom-btn"
                    onClick={() => {
                      if (svgRef.current) {
                        const svg = d3.select(svgRef.current);
                        svg.transition().duration(750).call(
                          d3.zoom().transform as any,
                          d3.zoomIdentity
                        );
                      }
                    }}
                    title="Reset zoom and position"
                  >
                    🔍 Reset View
                  </button>
                </div>
                <svg
                  ref={svgRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  {/* D3 visualization will be rendered here */}
                </svg>
              </div>
              
              <div className="visualization-stats">
                {projects && allDependencies && (
                  <div className="stats-grid">
                    <div className="stat-item">
                      <strong>Total Projects:</strong> {projects.length}
                    </div>
                    <div className="stat-item">
                      <strong>Total Dependencies:</strong> {allDependencies.length}
                    </div>
                    <div className="stat-item">
                      <strong>Projects with Dependencies:</strong> {new Set(allDependencies.map(d => d.sourceProjectKey)).size}
                    </div>
                    <div className="stat-item">
                      <strong>Projects that are Dependencies:</strong> {new Set(allDependencies.map(d => d.targetProjectKey)).size}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Box>
        </ModalBody>
      </ModalDialog>
    </ModalTransition>
  );
}
