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
  // MANUAL LAYOUT with multi-row/column wrapping
  // Group nodes by hierarchy level (0, 1, 2, 3, 4)
  const nodesByLevel = new Map<number, Node[]>();

  nodes.forEach((node) => {
    const level = (node.data as any).hierarchyLevel ?? 4;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });

  const nodeWidth = 220;
  const nodeHeight = 120;
  const levelSpacingTB = 200;  // Space between hierarchy levels (top-bottom)
  const levelSpacingLR = 400;  // Space between hierarchy levels (left-right)
  const boxSpacing = 150;      // WHITE SPACE between boxes (box-to-box gap)
  const rowSpacing = 100;      // Space between rows/columns within same level
  const maxPerRow = 6;         // Maximum entities per row (TB) or column (LR)
  const startX = 100;
  const startY = 100;

  const layoutedNodes: Node[] = [];
  let currentLevelOffsetY = 0;  // Track Y offset for TB
  let currentLevelOffsetX = 0;  // Track X offset for LR

  if (direction === 'TB') {
    // TOP to BOTTOM layout with row wrapping
    [0, 1, 2, 3, 4].forEach((level) => {
      const levelNodes = nodesByLevel.get(level) || [];

      // Calculate how many rows needed for this level
      const numRows = Math.ceil(levelNodes.length / maxPerRow);

      // Start Y position for this level
      const levelStartY = startY + currentLevelOffsetY;

      // Process each row
      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const rowStartIdx = rowIndex * maxPerRow;
        const rowEndIdx = Math.min(rowStartIdx + maxPerRow, levelNodes.length);
        const rowNodes = levelNodes.slice(rowStartIdx, rowEndIdx);

        // Calculate width of this row and center it
        const rowWidth = rowNodes.length * nodeWidth + (rowNodes.length - 1) * boxSpacing;
        const rowStartX = startX + (3000 - rowWidth) / 2;
        const y = levelStartY + (rowIndex * (nodeHeight + rowSpacing));

        // Position nodes in this row
        rowNodes.forEach((node, nodeIndex) => {
          const x = rowStartX + (nodeIndex * (nodeWidth + boxSpacing));
          layoutedNodes.push({
            ...node,
            position: { x, y },
          });
        });
      }

      // Update offset for next level (total height of this level + level spacing)
      const levelHeight = numRows * nodeHeight + (numRows - 1) * rowSpacing;
      currentLevelOffsetY += levelHeight + levelSpacingTB;
    });
  } else {
    // LEFT to RIGHT layout with column wrapping
    [0, 1, 2, 3, 4].forEach((level) => {
      const levelNodes = nodesByLevel.get(level) || [];

      // Calculate how many columns needed for this level
      const numCols = Math.ceil(levelNodes.length / maxPerRow);

      // Start X position for this level
      const levelStartX = startX + currentLevelOffsetX;

      // Process each column
      for (let colIndex = 0; colIndex < numCols; colIndex++) {
        const colStartIdx = colIndex * maxPerRow;
        const colEndIdx = Math.min(colStartIdx + maxPerRow, levelNodes.length);
        const colNodes = levelNodes.slice(colStartIdx, colEndIdx);

        // Calculate height of this column and center it
        const colHeight = colNodes.length * nodeHeight + (colNodes.length - 1) * boxSpacing;
        const colStartY = startY + (3000 - colHeight) / 2;
        const x = levelStartX + (colIndex * (nodeWidth + rowSpacing));

        // Position nodes in this column
        colNodes.forEach((node, nodeIndex) => {
          const y = colStartY + (nodeIndex * (nodeHeight + boxSpacing));
          layoutedNodes.push({
            ...node,
            position: { x, y },
          });
        });
      }

      // Update offset for next level (total width of this level + level spacing)
      const levelWidth = numCols * nodeWidth + (numCols - 1) * rowSpacing;
      currentLevelOffsetX += levelWidth + levelSpacingLR;
    });
  }

  return { nodes: layoutedNodes, edges };
};
