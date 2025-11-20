/**
 * SearchBar component with autocomplete for entity search
 */
import { useState, useEffect, useRef } from 'react';
import type { Entity } from '../types';

interface SearchBarProps {
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
  className?: string;
}

const SearchBar = ({ entities, onSelectEntity, className = '' }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter entities based on search term
  const filteredEntities = searchTerm.trim()
    ? entities.filter((entity) => {
        const term = searchTerm.toLowerCase();
        return (
          entity.label.toLowerCase().includes(term) ||
          entity.logicalName.toLowerCase().includes(term) ||
          entity.description?.toLowerCase().includes(term)
        );
      }).slice(0, 8) // Limit to 8 results
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredEntities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredEntities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredEntities[highlightedIndex]) {
          handleSelectEntity(filteredEntities[highlightedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectEntity = (entityId: string) => {
    onSelectEntity(entityId);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(0);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.trim().length > 0);
    setHighlightedIndex(0);
  };

  const getHierarchyColor = (level?: number) => {
    switch (level) {
      case 1:
        return 'text-red-600 bg-red-50';
      case 2:
        return 'text-blue-600 bg-blue-50';
      case 3:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-purple-600 bg-purple-50';
    }
  };

  const getHierarchyLabel = (level?: number) => {
    switch (level) {
      case 1:
        return 'L1';
      case 2:
        return 'L2';
      case 3:
        return 'L3';
      default:
        return 'L0';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.trim() && setIsOpen(true)}
          placeholder="🔍 Search entities... (e.g., bonds, portfolio)"
          className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && filteredEntities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            {filteredEntities.length} result{filteredEntities.length !== 1 ? 's' : ''} found
          </div>
          {filteredEntities.map((entity, index) => (
            <button
              key={entity.id}
              onClick={() => handleSelectEntity(entity.id)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 text-xs font-semibold rounded ${getHierarchyColor(
                        entity.hierarchyLevel
                      )}`}
                    >
                      {getHierarchyLabel(entity.hierarchyLevel)}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{entity.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {entity.logicalName}
                  </div>
                  {entity.description && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {entity.description}
                    </div>
                  )}
                </div>
                {entity.isCustomEntity && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded shrink-0">
                    Custom
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && searchTerm.trim() && filteredEntities.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center">
          <div className="text-gray-400 dark:text-gray-500 text-sm">No entities found for "{searchTerm}"</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try searching by name or logical name</div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
