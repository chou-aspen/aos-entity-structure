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
  const { label, isCustomEntity, isActivity, isHighlighted, isGrayedOut, description, hierarchyLevel, logicalName, relationshipCount, requiredFields } = data;
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);

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

      {/* Hover Tooltip - Interactive with scroll support for light/dark mode */}
      {showTooltip && !isGrayedOut && (
        <div
          className="absolute z-[100] left-full top-1/2 -translate-y-1/2 ml-3 w-80 bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-4 backdrop-blur-sm pointer-events-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Arrow pointing to the card */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-[-2px] border-8 border-transparent border-r-white dark:border-r-gray-900"></div>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-[-1px] border-[9px] border-transparent border-r-gray-200 dark:border-r-gray-700"></div>

          <div className="space-y-3">
            <div>
              <div className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm">{label}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">{logicalName}</div>
            </div>

            {/* Show required fields if available (for hierarchy levels 1, 2, 3), otherwise show description */}
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
