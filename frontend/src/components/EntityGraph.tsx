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
  useReactFlow,
  MarkerType,
  Panel,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import EntityNode from './EntityNode';
import SearchBar from './SearchBar';
import { useGraphData } from '../hooks/useGraphData';
import { getRadialLayout, getFullCircularLayout } from '../utils/layoutHelpers';
import { useTheme } from '../contexts/ThemeContext';
import type { Entity, Relationship } from '../types';

const nodeTypes: NodeTypes = {
  entityNode: EntityNode,
};

const EntityGraph = () => {
  const { data, loading, error } = useGraphData();
  const { fitView } = useReactFlow(); // Get fitView function for auto zoom/pan
  const { theme, toggleTheme } = useTheme(); // Dark mode
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [_isFocusedView, setIsFocusedView] = useState<boolean>(false);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState<Array<{ id: string, label: string }>>([]);
  const [visibleLevels, setVisibleLevels] = useState<Set<number>>(new Set([0, 1, 2, 3]));

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
    const flowNodes: Node[] = data.nodes.map((entity: Entity) => {
      // Count relationships for this entity
      const relationshipCount = data.edges.filter(
        (edge) => edge.sourceEntity === entity.id || edge.targetEntity === entity.id
      ).length;

      return {
        id: entity.id,
        type: 'entityNode',
        data: {
          ...entity,
          isHighlighted: false,
          isGrayedOut: false,
          relationshipCount,
        },
        position: { x: 0, y: 0 }, // Will be calculated by layout
        style: { opacity: 1, transition: 'opacity 0.3s ease-in-out' }, // Smooth fade animation
      };
    });

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

    // Apply CIRCULAR layout for full view - equal space distribution!
    // No more dragging left to right - entities arranged in concentric circles
    const { nodes: layoutedNodes, edges: layoutedEdges } = getFullCircularLayout(
      flowNodes,
      flowEdges
    );

    // Store full dataset for focused view switching
    setFullNodes(layoutedNodes);
    setFullEdges(layoutedEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Auto-zoom to fit all entities on initial load
    setTimeout(() => {
      fitView({
        padding: 0.15,
        duration: 1000,
        maxZoom: 0.8,
        minZoom: 0.1,
      });
    }, 200);
  }, [data, setNodes, setEdges, fitView]);

  // Apply hierarchy level filtering
  useEffect(() => {
    if (fullNodes.length === 0 || selectedEntityId) return; // Don't filter in focused view

    const filteredNodes = fullNodes.map(node => ({
      ...node,
      hidden: !visibleLevels.has((node.data as any).hierarchyLevel ?? 0),
    }));

    setNodes(filteredNodes);
  }, [visibleLevels, fullNodes, selectedEntityId, setNodes]);

  // Handle node click - NEW: Show focused view with only selected entity + direct neighbors
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const entityId = node.id;

      if (selectedEntityId === entityId) {
        // Clicking same entity - deselect and restore full view
        setSelectedEntityId(null);
        setIsFocusedView(false);
        setBreadcrumbTrail([]);

        // Restore all nodes and edges with full hierarchy layout
        setNodes(fullNodes);
        setEdges(fullEdges);
      } else {
        // Clicking new entity - enter focused view
        setSelectedEntityId(entityId);
        setIsFocusedView(true);

        // Add to breadcrumb trail
        const entityData = node.data as any;
        setBreadcrumbTrail(prev => [...prev, { id: entityId, label: entityData.label }]);

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

          // AUTO FIT VIEW: Pan and zoom to show all focused entities in viewport
          // Small delay to allow React Flow to update node positions first
          setTimeout(() => {
            fitView({
              padding: 0.2, // 20% padding around edges for breathing room
              duration: 800, // Smooth 800ms animation
              maxZoom: 1.5,  // Don't zoom in too close
              minZoom: 0.5,  // Don't zoom out too far
            });
          }, 50);
        }, 300); // Match CSS transition duration
      }
    },
    [selectedEntityId, adjacencyMap, fullNodes, fullEdges, setNodes, setEdges, fitView]
  );

  // Handle pane click - Restore full view with auto-zoom centered on account
  const onPaneClick = useCallback(() => {
    if (selectedEntityId) {
      setSelectedEntityId(null);
      setIsFocusedView(false);
      setBreadcrumbTrail([]);

      // Restore full hierarchy layout
      setNodes(fullNodes);
      setEdges(fullEdges);

      // Auto-zoom to fit all entities with smooth animation
      setTimeout(() => {
        fitView({
          padding: 0.15,     // 15% padding for better view
          duration: 800,     // Smooth 800ms animation
          maxZoom: 0.8,      // Reasonable zoom level to see everything
          minZoom: 0.1,      // Allow zooming out far
        });
      }, 100);
    }
  }, [selectedEntityId, fullNodes, fullEdges, setNodes, setEdges, fitView]);

  // Handle search selection - triggers focus on selected entity
  const handleSearchSelect = useCallback((entityId: string) => {
    const node = fullNodes.find(n => n.id === entityId);
    if (node) {
      // Simulate node click to trigger focused view
      onNodeClick({} as React.MouseEvent, node);
    }
  }, [fullNodes, onNodeClick]);

  // Handle hierarchy level filter toggle
  const toggleHierarchyLevel = useCallback((level: number) => {
    setVisibleLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  }, []);

  // Handle breadcrumb click - navigate to that entity in the trail
  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index === -1) {
      // Clicked "All Entities" - return to full view
      setSelectedEntityId(null);
      setIsFocusedView(false);
      setBreadcrumbTrail([]);
      setNodes(fullNodes);
      setEdges(fullEdges);
    } else {
      // Navigate to a specific entity in the trail
      const targetBreadcrumb = breadcrumbTrail[index];
      const node = fullNodes.find(n => n.id === targetBreadcrumb.id);

      if (node) {
        // Trim breadcrumb trail to clicked position
        setBreadcrumbTrail(prev => prev.slice(0, index + 1));

        // Trigger focus view for that entity
        setSelectedEntityId(targetBreadcrumb.id);
        setIsFocusedView(true);

        const relatedEntities = adjacencyMap.get(targetBreadcrumb.id) || new Set();
        const focusedNodeIds = new Set([targetBreadcrumb.id, ...Array.from(relatedEntities)]);

        const focusedNodes = fullNodes.filter(n => focusedNodeIds.has(n.id));
        const focusedEdges = fullEdges.filter(e =>
          focusedNodeIds.has(e.source) && focusedNodeIds.has(e.target)
        );

        const layoutedFocusedNodes = getRadialLayout(focusedNodes, targetBreadcrumb.id, focusedEdges);

        setNodes(layoutedFocusedNodes.map(n => ({
          ...n,
          style: { ...n.style, opacity: 1 },
          data: {
            ...n.data,
            isHighlighted: n.id === targetBreadcrumb.id,
          },
        })));

        setEdges(focusedEdges.map(e => ({
          ...e,
          animated: true,
          style: { ...e.style, opacity: 1, stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        })));

        setTimeout(() => {
          fitView({ padding: 0.2, duration: 800, maxZoom: 1.5, minZoom: 0.5 });
        }, 50);
      }
    }
  }, [breadcrumbTrail, fullNodes, fullEdges, adjacencyMap, setNodes, setEdges, fitView]);

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
            if (data.isHighlighted) return '#6366f1'; // Indigo for highlighted
            if (data.isGrayedOut) return '#e5e7eb';   // Gray for grayed out
            // Modern color palette matching entity cards
            switch (data.hierarchyLevel) {
              case 1: return '#fb7185'; // Rose for account (L1)
              case 2: return '#22d3ee'; // Cyan for portfolio/project (L2)
              case 3: return '#34d399'; // Emerald for child entities (L3)
              default: return data.isCustomEntity ? '#a78bfa' : '#94a3b8'; // Purple/Slate
            }
          }}
        />
        <Panel position="top-left" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              AOS Entity Viewer
            </h2>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            entities={data?.nodes || []}
            onSelectEntity={handleSearchSelect}
            className="mb-3"
          />

          {/* Breadcrumb Navigation */}
          {breadcrumbTrail.length > 0 && (
            <div className="mb-3 flex items-center gap-1 text-sm overflow-x-auto">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline whitespace-nowrap"
              >
                All Entities
              </button>
              {breadcrumbTrail.map((crumb, index) => (
                <div key={index} className="flex items-center gap-1 shrink-0">
                  <span className="text-gray-400 dark:text-gray-500">›</span>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`hover:underline whitespace-nowrap ${index === breadcrumbTrail.length - 1
                      ? 'text-gray-800 dark:text-gray-200 font-semibold cursor-default'
                      : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                      }`}
                  >
                    {crumb.label}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p>Entities: {data?.nodeCount || 0}</p>
            <p>Relationships: {data?.edgeCount || 0}</p>
            {selectedEntityId && (
              <p className="text-blue-600 dark:text-blue-400 font-semibold">
                Viewing: {(nodes.find((n: Node) => n.id === selectedEntityId)?.data as any)?.label}
              </p>
            )}
          </div>
        </Panel>
        <Panel position="top-right" className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <p className="font-semibold mb-2 text-gray-800 dark:text-white">Instructions:</p>
          <ul className="space-y-1 mb-3">
            <li>• Click entity to highlight relationships</li>
            <li>• Click background to reset view</li>
            <li>• Scroll to zoom, drag to pan</li>
          </ul>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <p className="font-semibold mb-2 text-gray-800 dark:text-white">Filter by Hierarchy:</p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={visibleLevels.has(1)}
                  onChange={() => toggleHierarchyLevel(1)}
                  className="w-3.5 h-3.5 text-rose-500 rounded focus:ring-1 focus:ring-rose-500"
                />
                <div className="w-5 h-5 border-2 border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">Account (L1)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={visibleLevels.has(2)}
                  onChange={() => toggleHierarchyLevel(2)}
                  className="w-3.5 h-3.5 text-cyan-500 rounded focus:ring-1 focus:ring-cyan-500"
                />
                <div className="w-5 h-5 border-2 border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">Portfolio/Project (L2)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={visibleLevels.has(3)}
                  onChange={() => toggleHierarchyLevel(3)}
                  className="w-3.5 h-3.5 text-emerald-500 rounded focus:ring-1 focus:ring-emerald-500"
                />
                <div className="w-5 h-5 border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">Child Entities (L3)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={visibleLevels.has(0)}
                  onChange={() => toggleHierarchyLevel(0)}
                  className="w-3.5 h-3.5 text-purple-500 rounded focus:ring-1 focus:ring-purple-500"
                />
                <div className="w-5 h-5 border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">Other qrt_ (L0)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={visibleLevels.has(-1)}
                  onChange={() => toggleHierarchyLevel(-1)}
                  className="w-3.5 h-3.5 text-slate-500 rounded focus:ring-1 focus:ring-slate-500"
                />
                <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-300 text-xs font-medium">System (Contact, User)</span>
              </label>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default EntityGraph;
