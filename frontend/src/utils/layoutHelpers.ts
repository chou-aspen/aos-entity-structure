/**
 * Graph layout utilities using Dagre algorithm
 */
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeWidth?: number;
  nodeHeight?: number;
  ranksep?: number;
  nodesep?: number;
}

/**
 * Calculate positions for nodes using Dagre layout algorithm
 */
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } => {
  const {
    direction = 'TB',
    nodeWidth = 200,
    nodeHeight = 100,
    ranksep = 150,
    nodesep = 100,
  } = options;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep,
    nodesep,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Calculate force-directed layout for better visualization
 * Simple implementation for initial positioning
 */
export const getCircularLayout = (nodes: Node[]): Node[] => {
  const centerX = 400;
  const centerY = 400;
  const radius = Math.min(300, nodes.length * 20);

  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });
};

/**
 * Radial layout for focused entity view
 *
 * UX Design: When user clicks an entity, show it at center with direct connections radiating outward
 * - Selected entity positioned at center
 * - Connected entities arranged in a circle around it
 * - Organized by hierarchy level for visual clarity
 * - Optimal for exploring "what connects to this entity"
 *
 * @param nodes - Array of nodes to layout (should be filtered to selected + neighbors)
 * @param selectedNodeId - ID of the clicked/selected entity
 * @param edges - Edges to help organize positioning
 * @returns Nodes with radial positions centered on selected entity
 */
export const getRadialLayout = (
  nodes: Node[],
  selectedNodeId: string,
  _edges: Edge[]
): Node[] => {
  const centerX = 500; // Center of viewport
  const centerY = 400;

  // Separate selected node from neighbors
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const neighborNodes = nodes.filter(n => n.id !== selectedNodeId);

  if (!selectedNode) return nodes;

  // Group neighbors by hierarchy level for organized positioning
  const level1Neighbors: Node[] = [];
  const level2Neighbors: Node[] = [];
  const level3Neighbors: Node[] = [];
  const otherNeighbors: Node[] = [];

  neighborNodes.forEach(node => {
    const hierarchyLevel = (node.data as any).hierarchyLevel;
    switch (hierarchyLevel) {
      case 1:
        level1Neighbors.push(node);
        break;
      case 2:
        level2Neighbors.push(node);
        break;
      case 3:
        level3Neighbors.push(node);
        break;
      default:
        otherNeighbors.push(node);
    }
  });

  // Calculate radius based on number of neighbors (more nodes = larger circle)
  const baseRadius = 250;
  const radiusMultiplier = Math.max(1, Math.ceil(neighborNodes.length / 12));
  const radius = baseRadius * radiusMultiplier;

  // Position selected entity at center
  const layoutedNodes: Node[] = [
    {
      ...selectedNode,
      position: { x: centerX, y: centerY },
    },
  ];

  // Position neighbors in circular pattern, grouped by hierarchy
  const allNeighbors = [
    ...level1Neighbors,
    ...level2Neighbors,
    ...level3Neighbors,
    ...otherNeighbors,
  ];

  allNeighbors.forEach((node, index) => {
    // Distribute evenly around circle
    const angle = (2 * Math.PI * index) / allNeighbors.length - Math.PI / 2; // Start at top
    layoutedNodes.push({
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    });
  });

  return layoutedNodes;
};

/**
 * Optimized hierarchy-aware layout for entity relationship visualization
 *
 * UI/UX Design Principles Applied:
 * 1. Clear visual hierarchy with distinct tier separation
 * 2. Left-to-right reading pattern within each tier
 * 3. Connected entities grouped together
 * 4. Generous spacing to reduce cognitive load
 * 5. Relationship-based positioning for scannable flow
 *
 * Level 1 (account) -> Level 2 (portfolio/project) -> Level 3 (child entities)
 * Supports both vertical (TB) and horizontal (LR) layouts
 */
export const getHierarchyLayout = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // UX-Optimized Dagre Configuration
  dagreGraph.setGraph({
    rankdir: direction,

    // INCREASED SPACING for better visual hierarchy clarity
    ranksep: 300,  // Increased from 200 to 300 for clearer tier separation
    nodesep: 100,  // Reduced from 150 to 100 for tighter horizontal grouping
    edgesep: 20,   // Space between edges to prevent visual clutter

    // ALIGNMENT for consistent left-to-right reading pattern
    align: 'UL',   // Up-Left alignment - nodes align to top-left within their rank

    // RANKER for optimal hierarchy positioning
    ranker: 'network-simplex', // Better than 'tight-tree' for minimizing edge crossings

    // MARGINS for breathing room
    marginx: 40,
    marginy: 40,
  });

  // Build edge weight map for relationship-based positioning
  const edgeWeightMap = new Map<string, number>();

  edges.forEach((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceLevel = (sourceNode.data as any).hierarchyLevel || 0;
      const targetLevel = (targetNode.data as any).hierarchyLevel || 0;

      // Higher weight for hierarchy-following edges (1->2, 2->3)
      // This encourages dagre to keep hierarchical relationships straight
      let weight = 1;
      if (sourceLevel === 1 && targetLevel === 2) weight = 10; // account -> portfolio/project
      if (sourceLevel === 2 && targetLevel === 3) weight = 10; // portfolio/project -> children
      if (sourceLevel === 1 && targetLevel === 3) weight = 5;  // account -> children (direct)

      edgeWeightMap.set(`${edge.source}-${edge.target}`, weight);
    }
  });

  // Add nodes with explicit rank assignment based on hierarchy level
  nodes.forEach((node) => {
    const hierarchyLevel = (node.data as any).hierarchyLevel || 99;
    const nodeWidth = 200;
    const nodeHeight = 100;

    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      // Explicitly set rank to force strict hierarchy ordering
      rank: hierarchyLevel === 0 ? 99 : hierarchyLevel,
    });
  });

  // Add edges with weights for relationship-based positioning
  edges.forEach((edge) => {
    const weight = edgeWeightMap.get(`${edge.source}-${edge.target}`) || 1;
    dagreGraph.setEdge(edge.source, edge.target, {
      weight: weight,
      minlen: 1, // Minimum edge length to maintain hierarchy separation
    });
  });

  // Run optimized dagre layout
  dagre.layout(dagreGraph);

  // Apply calculated positions with centering adjustment
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100, // nodeWidth / 2
        y: nodeWithPosition.y - 50,  // nodeHeight / 2
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
