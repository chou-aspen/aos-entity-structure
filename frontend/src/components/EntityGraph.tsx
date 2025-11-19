/**
 * Main component for visualizing Dynamics 365 entity relationships
 */
import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import EntityNode from './EntityNode';
import { useGraphData } from '../hooks/useGraphData';
import { getHierarchyLayout, getRadialLayout } from '../utils/layoutHelpers';
import type { Entity, Relationship } from '../types';

const nodeTypes: NodeTypes = {
  entityNode: EntityNode,
};

const EntityGraph = () => {
  const { data, loading, error } = useGraphData();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  const [_isFocusedView, setIsFocusedView] = useState<boolean>(false);

  // Store full dataset for switching between views
  const [fullNodes, setFullNodes] = useState<Node[]>([]);
  const [fullEdges, setFullEdges] = useState<Edge[]>([]);

  // Build adjacency map for quick relationship lookup
  const adjacencyMap = useMemo(() => {
    if (!data) return new Map<string, Set<string>>();

    const map = new Map<string, Set<string>>();

    data.edges.forEach((edge) => {
      if (!map.has(edge.sourceEntity)) {
        map.set(edge.sourceEntity, new Set());
      }
      if (!map.has(edge.targetEntity)) {
        map.set(edge.targetEntity, new Set());
      }

      map.get(edge.sourceEntity)?.add(edge.targetEntity);
      map.get(edge.targetEntity)?.add(edge.sourceEntity);
    });

    return map;
  }, [data]);

  // Transform data into React Flow format
  useEffect(() => {
    if (!data) return;

    // Create nodes from entities
    const flowNodes: Node[] = data.nodes.map((entity: Entity) => ({
      id: entity.id,
      type: 'entityNode',
      data: {
        ...entity,
        isHighlighted: false,
        isGrayedOut: false,
      },
      position: { x: 0, y: 0 }, // Will be calculated by layout
      style: { opacity: 1, transition: 'opacity 0.3s ease-in-out' }, // Smooth fade animation
    }));

    // Create edges from relationships
    const flowEdges: Edge[] = data.edges.map((rel: Relationship) => ({
      id: rel.id,
      source: rel.sourceEntity,
      target: rel.targetEntity,
      type: rel.type === 'ManyToMany' ? 'default' : 'default',
      animated: false,
      label: rel.type === 'ManyToMany' ? 'M:M' : '1:M',
      style: { stroke: '#94a3b8', strokeWidth: 2, opacity: 1, transition: 'opacity 0.3s ease-in-out' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
    }));

    // Apply hierarchy-aware layout for better entity organization
    const { nodes: layoutedNodes, edges: layoutedEdges } = getHierarchyLayout(
      flowNodes,
      flowEdges,
      layoutDirection
    );

    // Store full dataset for focused view switching
    setFullNodes(layoutedNodes);
    setFullEdges(layoutedEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, layoutDirection, setNodes, setEdges]);

  // Handle node click - NEW: Show focused view with only selected entity + direct neighbors
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const entityId = node.id;

      if (selectedEntityId === entityId) {
        // Clicking same entity - deselect and restore full view
        setSelectedEntityId(null);
        setIsFocusedView(false);

        // Restore all nodes and edges with full hierarchy layout
        setNodes(fullNodes);
        setEdges(fullEdges);
      } else {
        // Clicking new entity - enter focused view
        setSelectedEntityId(entityId);
        setIsFocusedView(true);

        // Get direct neighbors (1 level deep only - Option A)
        const relatedEntities = adjacencyMap.get(entityId) || new Set();

        // Filter: Show ONLY selected entity + direct neighbors
        const focusedNodeIds = new Set([entityId, ...Array.from(relatedEntities)]);

        // Phase 1: Fade out unrelated entities (smooth transition)
        setNodes((nds: Node[]) =>
          nds.map((n: Node) => ({
            ...n,
            style: {
              ...n.style,
              opacity: focusedNodeIds.has(n.id) ? 1 : 0, // Fade out unrelated
            },
            data: {
              ...n.data,
              isHighlighted: n.id === entityId, // Highlight selected
            },
          }))
        );

        setEdges((eds: Edge[]) =>
          eds.map((e: Edge) => {
            const isRelevant =
              (e.source === entityId || e.target === entityId) &&
              focusedNodeIds.has(e.source) &&
              focusedNodeIds.has(e.target);

            return {
              ...e,
              animated: isRelevant,
              style: {
                ...e.style,
                opacity: isRelevant ? 1 : 0, // Fade out unrelated edges
                stroke: isRelevant ? '#3b82f6' : '#94a3b8',
                strokeWidth: isRelevant ? 3 : 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isRelevant ? '#3b82f6' : '#94a3b8',
              },
            };
          })
        );

        // Phase 2: After fade animation, remove hidden nodes and apply radial layout
        setTimeout(() => {
          const focusedNodes = fullNodes.filter(n => focusedNodeIds.has(n.id));
          const focusedEdges = fullEdges.filter(e =>
            focusedNodeIds.has(e.source) && focusedNodeIds.has(e.target)
          );

          // Apply radial layout with selected entity at center
          const layoutedFocusedNodes = getRadialLayout(focusedNodes, entityId, focusedEdges);

          // Update with radial layout
          setNodes(layoutedFocusedNodes.map(n => ({
            ...n,
            style: { ...n.style, opacity: 1 },
            data: {
              ...n.data,
              isHighlighted: n.id === entityId,
            },
          })));

          setEdges(focusedEdges.map(e => ({
            ...e,
            animated: true,
            style: {
              ...e.style,
              opacity: 1,
              stroke: '#3b82f6',
              strokeWidth: 3,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          })));
        }, 300); // Match CSS transition duration
      }
    },
    [selectedEntityId, adjacencyMap, fullNodes, fullEdges, setNodes, setEdges]
  );

  // Handle pane click - Restore full view
  const onPaneClick = useCallback(() => {
    if (selectedEntityId) {
      setSelectedEntityId(null);
      setIsFocusedView(false);

      // Restore full hierarchy layout
      setNodes(fullNodes);
      setEdges(fullEdges);
    }
  }, [selectedEntityId, fullNodes, fullEdges, setNodes, setEdges]);

  const toggleLayout = () => {
    setLayoutDirection((prev) => (prev === 'TB' ? 'LR' : 'TB'));
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading entity data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-600 mt-4">
            Please ensure the backend server is running and Dynamics 365 credentials are valid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
        }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node: Node) => {
            const data = node.data as any;
            if (data.isHighlighted) return '#3b82f6';
            if (data.isGrayedOut) return '#e5e7eb';
            // Color by hierarchy level
            switch (data.hierarchyLevel) {
              case 1: return '#ef4444'; // Red for account
              case 2: return '#3b82f6'; // Blue for portfolio/project
              case 3: return '#22c55e'; // Green for child entities
              default: return data.isCustomEntity ? '#c084fc' : '#9ca3af';
            }
          }}
        />
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Dynamics 365 Entity Viewer
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Entities: {data?.nodeCount || 0}</p>
            <p>Relationships: {data?.edgeCount || 0}</p>
            {selectedEntityId && (
              <p className="text-blue-600 font-semibold">
                Viewing: {(nodes.find((n: Node) => n.id === selectedEntityId)?.data as any)?.label}
              </p>
            )}
          </div>
          <button
            onClick={toggleLayout}
            className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Switch to {layoutDirection === 'TB' ? 'Horizontal' : 'Vertical'}
          </button>
        </Panel>
        <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Instructions:</p>
          <ul className="space-y-1 mb-3">
            <li>• Click entity to highlight relationships</li>
            <li>• Click background to reset view</li>
            <li>• Scroll to zoom, drag to pan</li>
          </ul>

          <div className="border-t border-gray-200 pt-3 mt-3">
            <p className="font-semibold mb-2 text-gray-700">Entity Hierarchy:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-500 bg-red-50 rounded"></div>
                <span className="text-gray-600 text-xs">Account (Top)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
                <span className="text-gray-600 text-xs">Portfolio/Project</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
                <span className="text-gray-600 text-xs">Child Entities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-400 bg-white rounded"></div>
                <span className="text-gray-600 text-xs">Other Custom</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 bg-white rounded"></div>
                <span className="text-gray-600 text-xs">Standard</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default EntityGraph;
