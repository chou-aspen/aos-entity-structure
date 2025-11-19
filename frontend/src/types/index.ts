/**
 * Type definitions for Dynamics 365 entities and relationships
 */

export interface Entity {
  id: string;
  label: string;
  logicalName: string;
  schemaName: string;
  entitySetName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  isCustomEntity: boolean;
  isActivity: boolean;
  description: string;
  hierarchyLevel?: number; // 1=account, 2=portfolio/project, 3=child entities
}

export interface Relationship {
  id: string;
  schemaName: string;
  type: 'OneToMany' | 'ManyToMany';
  sourceEntity: string;
  targetEntity: string;
  sourceAttribute?: string;
  targetAttribute?: string;
  intersectEntity?: string;
  entity1Attribute?: string;
  entity2Attribute?: string;
  relationshipBehavior?: any;
}

export interface GraphData {
  nodes: Entity[];
  edges: Relationship[];
  nodeCount: number;
  edgeCount: number;
}
