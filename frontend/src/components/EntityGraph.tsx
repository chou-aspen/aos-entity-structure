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
import { getHierarchyLayout } from '../utils/layoutHelpers';
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
    }));

    // Create edges from relationships
    const flowEdges: Edge[] = data.edges.map((rel: Relationship) => ({
      id: rel.id,
      source: rel.sourceEntity,
      target: rel.targetEntity,
      type: rel.type === 'ManyToMany' ? 'default' : 'default',
      animated: false,
      label: rel.type === 'ManyToMany' ? 'M:M' : '1:M',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
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

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, layoutDirection, setNodes, setEdges]);

  // Handle node click to highlight related entities
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const entityId = node.id;

      if (selectedEntityId === entityId) {
        // Deselect - show all entities normally
        setSelectedEntityId(null);
        setNodes((nds: Node[]) =>
          nds.map((n: Node) => ({
            ...n,
            data: { ...n.data, isHighlighted: false, isGrayedOut: false },
          }))
        );
        setEdges((eds: Edge[]) =>
          eds.map((e: Edge) => ({
            ...e,
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          }))
        );
      } else {
        // Select - highlight related entities
        setSelectedEntityId(entityId);
        const relatedEntities = adjacencyMap.get(entityId) || new Set();

        setNodes((nds: Node[]) =>
          nds.map((n: Node) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === entityId,
              isGrayedOut: n.id !== entityId && !relatedEntities.has(n.id),
            },
          }))
        );

        setEdges((eds: Edge[]) =>
          eds.map((e: Edge) => {
            const isRelated =
              (e.source === entityId && relatedEntities.has(e.target)) ||
              (e.target === entityId && relatedEntities.has(e.source));

            return {
              ...e,
              animated: isRelated,
              style: {
                stroke: isRelated ? '#3b82f6' : '#e2e8f0',
                strokeWidth: isRelated ? 3 : 1,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isRelated ? '#3b82f6' : '#e2e8f0',
              },
            };
          })
        );
      }
    },
    [selectedEntityId, adjacencyMap, setNodes, setEdges]
  );

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    if (selectedEntityId) {
      setSelectedEntityId(null);
      setNodes((nds: Node[]) =>
        nds.map((n: Node) => ({
          ...n,
          data: { ...n.data, isHighlighted: false, isGrayedOut: false },
        }))
      );
      setEdges((eds: Edge[]) =>
        eds.map((e: Edge) => ({
          ...e,
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
          },
        }))
      );
    }
  }, [selectedEntityId, setNodes, setEdges]);

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
