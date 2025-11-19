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
 * Hierarchy-aware layout that positions entities by their business hierarchy
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

  // Configure layout with hierarchy in mind
  dagreGraph.setGraph({
    rankdir: direction, // TB (top-bottom) or LR (left-right)
    ranksep: 200,  // Large spacing between hierarchy levels
    nodesep: 150,  // Spacing between nodes at same level
    ranker: 'tight-tree', // Better hierarchy visualization
  });

  // Group nodes by hierarchy level for reference
  const level1Nodes: Node[] = []; // account
  const level2Nodes: Node[] = []; // portfolio/project
  const level3Nodes: Node[] = []; // child entities
  const otherNodes: Node[] = [];

  nodes.forEach((node) => {
    const hierarchyLevel = (node.data as any).hierarchyLevel;
    const nodeWidth = 200;
    const nodeHeight = 100;

    // Set rank (priority) based on hierarchy level to force ordering
    const rank = hierarchyLevel || 4;
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      rank
    });

    // Categorize for reference
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

  // Add edges to define relationships
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run dagre layout
  dagre.layout(dagreGraph);

  // Apply calculated positions
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
