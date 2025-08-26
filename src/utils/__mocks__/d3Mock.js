// D3 Mock for Jest tests
module.exports = {
  // Force simulation
  forceSimulation: jest.fn(() => ({
    force: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    alpha: jest.fn().mockReturnThis(),
    alphaDecay: jest.fn().mockReturnThis(),
    alphaMin: jest.fn().mockReturnThis(),
    alphaTarget: jest.fn().mockReturnThis(),
    velocityDecay: jest.fn().mockReturnThis(),
    tick: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    nodes: jest.fn().mockReturnThis(),
    links: jest.fn().mockReturnThis(),
  })),
  
  // Force types
  forceLink: jest.fn(() => ({
    id: jest.fn().mockReturnThis(),
    distance: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
  })),
  forceManyBody: jest.fn(() => ({
    strength: jest.fn().mockReturnThis(),
    distanceMin: jest.fn().mockReturnThis(),
    distanceMax: jest.fn().mockReturnThis(),
  })),
  forceCenter: jest.fn(() => ({
    x: jest.fn().mockReturnThis(),
    y: jest.fn().mockReturnThis(),
  })),
  
  // Zoom
  zoom: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    scaleExtent: jest.fn().mockReturnThis(),
    translateExtent: jest.fn().mockReturnThis(),
  })),
  zoomIdentity: jest.fn(() => ({
    scale: jest.fn().mockReturnThis(),
    translate: jest.fn().mockReturnThis(),
  })),
  
  // Drag
  drag: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
  })),
  
  // Selection
  select: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    html: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    node: jest.fn(() => ({})),
  })),
  
  // Line generator
  line: jest.fn(() => ({
    x: jest.fn().mockReturnThis(),
    y: jest.fn().mockReturnThis(),
  })),
  
  // Scale
  scaleLinear: jest.fn(() => ({
    domain: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  })),
  
  // Color
  schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
  
  // Transition
  transition: jest.fn(() => ({
    duration: jest.fn().mockReturnThis(),
    delay: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  })),
};

