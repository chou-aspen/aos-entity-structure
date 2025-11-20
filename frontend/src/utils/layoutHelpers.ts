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
 * Hierarchical circular layout for full entity view (all 270+ entities)
 *
 * UX Design: Distributes ALL entities in concentric circles by hierarchy
 * - Equal space distribution - no more dragging left to right!
 * - Each hierarchy level gets its own ring
 * - Generous spacing to prevent overlap
 * - Users can zoom in/out as needed
 */
export const getFullCircularLayout = (nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 1500; // Larger center for more space
  const centerY = 1500;

  // Group nodes by hierarchy level
  const level1Nodes: Node[] = [];
  const level2Nodes: Node[] = [];
  const level3Nodes: Node[] = [];
  const otherNodes: Node[] = [];

  nodes.forEach(node => {
    const hierarchyLevel = (node.data as any).hierarchyLevel;
    switch (hierarchyLevel) {
      case 1:
        level1Nodes.push(node);
        break;
      case 2:
        level2Nodes.push(node);
        break;
      case 3:
        level3Nodes.push(node);
        break;
      default:
        otherNodes.push(node);
    }
  });

  // GENEROUS radii for full view - plenty of space between entities
  const innerRadius = 400;    // Level 1 (red) - innermost ring
  const middleRadius = 800;   // Level 2 (blue)
  const outerRadius = 1200;   // Level 3 (green)
  const defaultRadius = 4800; // Other entities (white/purple) - EXTRA LARGE outermost ring (2x increase)

  const layoutedNodes: Node[] = [];

  // Helper function to position nodes in a circle
  const positionNodesInCircle = (nodeList: Node[], radius: number) => {
    if (nodeList.length === 0) return;

    nodeList.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodeList.length - Math.PI / 2;
      layoutedNodes.push({
        ...node,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      });
    });
  };

  // Position each hierarchy level in concentric circles
  positionNodesInCircle(level1Nodes, innerRadius);
  positionNodesInCircle(level2Nodes, middleRadius);
  positionNodesInCircle(level3Nodes, outerRadius);
  positionNodesInCircle(otherNodes, defaultRadius);

  return { nodes: layoutedNodes, edges };
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

  // HIERARCHICAL CIRCULAR LAYERS - prevents entity overlap
  // Each hierarchy level gets its own ring/circle at different radius
  // INCREASED radii to ensure NO overlap - users can zoom in/out as needed
  const innerRadius = 300;    // Level 1 (red) - account entities
  const middleRadius = 550;   // Level 2 (blue) - portfolio/project
  const outerRadius = 800;    // Level 3 (green) - child entities
  const defaultRadius = 3000; // Other entities (white/purple) - EXTRA LARGE outermost ring (2x increase)

  // Position selected entity at center
  const layoutedNodes: Node[] = [
    {
      ...selectedNode,
      position: { x: centerX, y: centerY },
    },
  ];

  // Helper function to position nodes in a circle at given radius
  const positionNodesInCircle = (nodeList: Node[], radius: number) => {
    if (nodeList.length === 0) return;

    nodeList.forEach((node, index) => {
      // Distribute evenly around circle, starting at top (-PI/2)
      const angle = (2 * Math.PI * index) / nodeList.length - Math.PI / 2;
      layoutedNodes.push({
        ...node,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      });
    });
  };

  // Position each hierarchy level in its own circular layer
  positionNodesInCircle(level1Neighbors, innerRadius);   // Inner ring
  positionNodesInCircle(level2Neighbors, middleRadius);  // Middle ring
  positionNodesInCircle(level3Neighbors, outerRadius);   // Outer ring
  positionNodesInCircle(otherNeighbors, defaultRadius);  // Outermost ring

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
