/**
 * Custom node component for displaying entity information
 */
import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Entity } from '../types';

interface EntityNodeData extends Entity {
  isHighlighted?: boolean;
  isGrayedOut?: boolean;
  relationshipCount?: number;
}

const EntityNode = ({ data }: { data: EntityNodeData }) => {
  const { label, isCustomEntity, isActivity, isHighlighted, isGrayedOut, description, hierarchyLevel, logicalName, relationshipCount } = data;
  const [showTooltip, setShowTooltip] = useState(false);

  const baseClasses = "px-4 py-3 rounded-lg border-2 shadow-md transition-all duration-200 min-w-[180px]";

  // Get hierarchy-based colors - Modern, aesthetic design
  const getHierarchyColors = () => {
    if (isHighlighted) {
      return "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 shadow-xl scale-105 ring-2 ring-indigo-400/50";
    }
    if (isGrayedOut) {
      return "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-40";
    }

    switch (hierarchyLevel) {
      case 1: // account - Elegant Ruby/Coral (Top level)
        return "border-rose-400 dark:border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200";
      case 2: // qrt_portfolio, msdyn_project - Ocean Blue (Portfolio/Project level)
        return "border-cyan-400 dark:border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200";
      case 3: // Child entities - Fresh Emerald
        return "border-emerald-400 dark:border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200";
      default:
        // Default for other entities - Soft Purple or Neutral
        return isCustomEntity
          ? "border-purple-400 dark:border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 hover:shadow-xl hover:scale-102 transition-all duration-200"
          : "border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl hover:scale-102 transition-all duration-200";
    }
  };

  const highlightClasses = getHierarchyColors();
  const labelClasses = isGrayedOut
    ? "text-gray-500 dark:text-gray-400"
    : "text-gray-800 dark:text-gray-100 font-semibold";
  const badgeClasses = isCustomEntity
    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full font-medium"
    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full font-medium";

  const getHierarchyLabel = () => {
    switch (hierarchyLevel) {
      case 1: return 'Level 1 - Account';
      case 2: return 'Level 2 - Portfolio/Project';
      case 3: return 'Level 3 - Child Entity';
      default: return 'Level 0 - Other';
    }
  };

  return (
    <div
      className={`${baseClasses} ${highlightClasses} relative group`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />

      <div className="flex flex-col gap-1">
        <div className={labelClasses}>{label}</div>

        <div className="flex gap-1 flex-wrap">
          {isCustomEntity && (
            <span className={badgeClasses}>Custom</span>
          )}
          {isActivity && (
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-1 rounded-full font-medium">
              Activity
            </span>
          )}
        </div>

        {description && !isGrayedOut && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={description}>
            {description}
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {showTooltip && !isGrayedOut && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none">
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>

          <div className="space-y-2">
            <div>
              <div className="font-semibold text-white mb-1">{label}</div>
              <div className="text-gray-300 text-xs">{logicalName}</div>
            </div>

            {description && (
              <div className="border-t border-gray-700 pt-2">
                <div className="text-gray-400 line-clamp-3">{description}</div>
              </div>
            )}

            <div className="border-t border-gray-700 pt-2 flex justify-between text-gray-300">
              <span>{getHierarchyLabel()}</span>
              {relationshipCount !== undefined && (
                <span>{relationshipCount} connection{relationshipCount !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
};

export default memo(EntityNode);
