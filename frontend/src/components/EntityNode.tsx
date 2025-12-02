/**
 * Custom node component for displaying entity information
 */
import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { Entity } from '../types';

interface EntityNodeData extends Entity {
  isHighlighted?: boolean;
  isGrayedOut?: boolean;
  relationshipCount?: number;
  onHoverEntity?: (entityId: string | null) => void;
}

const EntityNode = ({ data }: { data: EntityNodeData }) => {
  const { label, isCustomEntity, isActivity, isHighlighted, isGrayedOut, description, hierarchyLevel, logicalName, relationshipCount, requiredFields, onHoverEntity } = data;
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const { getZoom } = useReactFlow();

  const handleMouseEnter = () => {
    setShowTooltip(true);
    onHoverEntity?.(logicalName || data.id);

    // Calculate tooltip position relative to viewport
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 12, // 12px to the right of the node
        y: rect.top + rect.height / 2, // Vertically centered
      });
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    onHoverEntity?.(null);
  };

  // Update tooltip position when scrolling/panning
  useEffect(() => {
    if (showTooltip && nodeRef.current) {
      const updatePosition = () => {
        if (nodeRef.current) {
          const rect = nodeRef.current.getBoundingClientRect();
          setTooltipPosition({
            x: rect.right + 12,
            y: rect.top + rect.height / 2,
          });
        }
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      return () => window.removeEventListener('scroll', updatePosition, true);
    }
  }, [showTooltip]);

  const baseClasses = "px-4 py-3 rounded-lg border-2 shadow-md transition-all duration-200 w-[220px]";

  // Get hierarchy-based colors - Modern, aesthetic design
  const getHierarchyColors = () => {
    if (isHighlighted) {
      return "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 shadow-xl scale-105 ring-2 ring-indigo-400/50";
    }
    if (isGrayedOut) {
      return "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-40";
    }

    switch (hierarchyLevel) {
      case 0: // System entities (contact, systemuser) - Neutral/Gray (First/Top)
        return "border-slate-400 dark:border-slate-500 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 hover:shadow-xl hover:scale-102 transition-all duration-200";
      case 1: // account - Elegant Ruby/Coral (Second level)
        return "border-rose-400 dark:border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200";
      case 2: // qrt_portfolio, msdyn_project - Ocean Blue (Third level - Portfolio/Project)
        return "border-cyan-400 dark:border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200";
      case 3: // Child entities - Fresh Emerald (Fourth level)
        return "border-emerald-400 dark:border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200";
      case 4: // Other qrt_ entities - Soft Purple (Fifth/Bottom level)
        return "border-purple-400 dark:border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200";
      default:
        // Fallback
        return "border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl hover:scale-102 transition-all duration-200";
    }
  };

  const highlightClasses = getHierarchyColors();
  const labelClasses = isGrayedOut
    ? "text-gray-500 dark:text-gray-400"
    : "text-gray-800 dark:text-gray-100 font-semibold";
  const badgeClasses = isCustomEntity
    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full font-medium"
    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full font-medium";

  // Check if entity is a system entity
  const systemEntities = ['contact', 'systemuser', 'account', 'msdyn_project'];
  const isSystemEntity = logicalName && systemEntities.includes(logicalName.toLowerCase());

  const getHierarchyLabel = () => {
    switch (hierarchyLevel) {
      case 0: return 'Level 0 - System';
      case 1: return 'Level 1 - Account';
      case 2: return 'Level 2 - Portfolio/Project';
      case 3: return 'Level 3 - Child Entity';
      case 4: return 'Level 4 - Other';
      default: return 'Other';
    }
  };

  const tooltipContent = showTooltip && !isGrayedOut && (
    <div
      className="fixed w-80 bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-4 backdrop-blur-sm pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        transform: `translateY(-50%) scale(${getZoom()})`,
        transformOrigin: 'left center',
        zIndex: 99999,
      }}
    >
      <div className="space-y-3">
        <div>
          <div className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm">{label}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">{logicalName}</div>
        </div>

        {requiredFields && requiredFields.length > 0 ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="text-gray-600 dark:text-gray-400 mb-2 text-xs font-bold uppercase tracking-wide">
              Required Fields ({requiredFields.length})
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {requiredFields.map((field, index) => (
                <div key={index} className="group">
                  <div className="text-gray-800 dark:text-gray-200 text-sm font-medium bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                    {field.displayName}
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 text-xs font-mono mt-0.5 ml-1">{field.logicalName}</div>
                </div>
              ))}
            </div>
          </div>
        ) : description ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="text-gray-600 dark:text-gray-400 mb-2 text-xs font-bold uppercase tracking-wide">Description</div>
            <div className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">{description}</div>
          </div>
        ) : null}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-500 dark:text-gray-500 mb-1 font-semibold uppercase tracking-wide">Hierarchy</div>
            <div className="text-gray-800 dark:text-gray-200 font-medium">{getHierarchyLabel()}</div>
          </div>
          {relationshipCount !== undefined && (
            <div>
              <div className="text-gray-500 dark:text-gray-500 mb-1 font-semibold uppercase tracking-wide">Connections</div>
              <div className="text-gray-800 dark:text-gray-200 font-medium">{relationshipCount}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={nodeRef}
        className={`${baseClasses} ${highlightClasses} relative group`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />

      <div className="flex flex-col gap-1">
        <div className={labelClasses}>{label}</div>

        <div className="flex gap-1 flex-wrap">
          {isSystemEntity && (
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
              System
            </span>
          )}
          {isCustomEntity && !isSystemEntity && (
            <span className={badgeClasses}>Custom</span>
          )}
          {isActivity && (
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-1 rounded-full font-medium">
              Activity
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>

    {/* Render tooltip via portal at root level - always on top */}
    {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
};

export default memo(EntityNode);
