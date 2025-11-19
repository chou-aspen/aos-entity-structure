/**
 * Custom node component for displaying entity information
 */
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Entity } from '../types';

interface EntityNodeData extends Entity {
  isHighlighted?: boolean;
  isGrayedOut?: boolean;
}

const EntityNode = ({ data }: { data: EntityNodeData }) => {
  const { label, isCustomEntity, isActivity, isHighlighted, isGrayedOut, description, hierarchyLevel } = data;

  const baseClasses = "px-4 py-3 rounded-lg border-2 shadow-md transition-all duration-200 min-w-[180px]";

  // Get hierarchy-based colors
  const getHierarchyColors = () => {
    if (isHighlighted) return "border-blue-500 bg-blue-50 shadow-lg scale-105";
    if (isGrayedOut) return "border-gray-300 bg-gray-100 opacity-40";

    switch (hierarchyLevel) {
      case 1: // account - Red/Orange (Top level)
        return "border-red-500 bg-red-50 hover:shadow-lg";
      case 2: // qrt_portfolio, msdyn_project - Blue (Portfolio/Project level)
        return "border-blue-500 bg-blue-50 hover:shadow-lg";
      case 3: // Child entities - Green
        return "border-green-500 bg-green-50 hover:shadow-lg";
      default:
        // Default for other entities
        return isCustomEntity
          ? "border-purple-400 bg-white hover:shadow-lg"
          : "border-gray-400 bg-white hover:shadow-lg";
    }
  };

  const highlightClasses = getHierarchyColors();
  const labelClasses = isGrayedOut ? "text-gray-500" : "text-gray-800 font-semibold";
  const badgeClasses = isCustomEntity
    ? "bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
    : "bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded";

  return (
    <div className={`${baseClasses} ${highlightClasses}`}>
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
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
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

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
};

export default memo(EntityNode);
