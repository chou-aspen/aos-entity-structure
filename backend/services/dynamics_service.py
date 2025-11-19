"""
Service layer for processing Dynamics 365 entity and relationship data
"""
import logging
from typing import List, Dict, Any
import sys
from pathlib import Path

# Add parent directory to path to import dynamics_api
sys.path.append(str(Path(__file__).parent.parent.parent))
from dynamics_api.dynamics_api import DynamicsAPI


class DynamicsService:
    """
    Service class to handle business logic for entity and relationship data
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.dynamics_api = DynamicsAPI(logger=self.logger)

    @staticmethod
    def get_hierarchy_level(logical_name: str) -> int:
        """
        Determine the hierarchy level of an entity for color-coding visualization

        Level 1 (Red): account - Top level
        Level 2 (Blue): qrt_portfolio, msdyn_project - Portfolio/Project level
        Level 3 (Green): Child entities under portfolios

        :param logical_name: The logical name of the entity
        :return: Hierarchy level (1, 2, 3, or 0 for default)
        """
        logical_name = logical_name.lower()

        # Level 1: Top level (Red/Orange)
        if logical_name == 'account':
            return 1

        # Level 2: Portfolio/Project level (Blue)
        if logical_name in ['qrt_portfolio', 'msdyn_project']:
            return 2

        # Level 3: Child entities (Green)
        child_entities = [
            'qrt_bonds',
            'qrt_designrequests',
            'qrt_epca',
            'qrt_estimaterequests',
            'qrt_financerequests',
            'qrt_icrequest',
            'qrt_incentives',
            'qrt_interconnectionagreementsandpayments',
            'qrt_interconnectionapplicationsstudies',
            'qrt_permits',
            'qrt_procurementrequests',
            'qrt_sitecontrol',
            'qrt_studies',
            'qrt_titleandalta'
        ]
        if logical_name in child_entities:
            return 3

        # Default: no specific hierarchy level
        return 0

    def get_all_entities(self) -> List[Dict[str, Any]]:
        """
        Fetch all entity definitions and format them for the frontend

        :return: List of entity objects with id, label, type, and metadata
        """
        try:
            raw_entities = self.dynamics_api.get_all_entity_definitions()
            entities = []

            for entity in raw_entities.get('value', []):
                # Extract display name
                display_name = entity.get('DisplayName', {})
                if isinstance(display_name, dict):
                    labels = display_name.get('LocalizedLabels', [])
                    label = labels[0].get('Label', entity.get('LogicalName', 'Unknown')) if labels else entity.get('LogicalName', 'Unknown')
                else:
                    label = entity.get('LogicalName', 'Unknown')

                # Extract description
                description = entity.get('Description', {})
                if isinstance(description, dict):
                    desc_labels = description.get('LocalizedLabels', [])
                    desc_text = desc_labels[0].get('Label', '') if desc_labels else ''
                else:
                    desc_text = ''

                logical_name = entity.get('LogicalName')
                entity_obj = {
                    'id': logical_name,
                    'label': label,
                    'logicalName': logical_name,
                    'schemaName': entity.get('SchemaName'),
                    'entitySetName': entity.get('EntitySetName'),
                    'primaryIdAttribute': entity.get('PrimaryIdAttribute'),
                    'primaryNameAttribute': entity.get('PrimaryNameAttribute'),
                    'isCustomEntity': entity.get('IsCustomEntity', False),
                    'isActivity': entity.get('IsActivity', False),
                    'description': desc_text,
                    'hierarchyLevel': self.get_hierarchy_level(logical_name)
                }
                entities.append(entity_obj)

            self.logger.info(f"Processed {len(entities)} entities")
            return entities

        except Exception as e:
            self.logger.error(f"Error in get_all_entities: {e}")
            raise e

    def get_all_relationships_consolidated(self) -> Dict[str, Any]:
        """
        Fetch all relationships and consolidate them into a graph-friendly format

        :return: Dictionary with entities and edges
        """
        try:
            raw_relationships = self.dynamics_api.get_all_relationships()
            relationships = []

            for rel in raw_relationships.get('value', []):
                rel_type = rel.get('@odata.type', '')

                if 'OneToManyRelationshipMetadata' in rel_type:
                    # One-to-Many relationship
                    relationship_obj = {
                        'id': rel.get('SchemaName', ''),
                        'schemaName': rel.get('SchemaName'),
                        'type': 'OneToMany',
                        'sourceEntity': rel.get('ReferencedEntity'),  # The "One" side
                        'targetEntity': rel.get('ReferencingEntity'),  # The "Many" side
                        'sourceAttribute': rel.get('ReferencedAttribute'),
                        'targetAttribute': rel.get('ReferencingAttribute'),
                        'relationshipBehavior': rel.get('CascadeConfiguration', {}),
                    }
                    relationships.append(relationship_obj)

                elif 'ManyToManyRelationshipMetadata' in rel_type:
                    # Many-to-Many relationship
                    relationship_obj = {
                        'id': rel.get('SchemaName', ''),
                        'schemaName': rel.get('SchemaName'),
                        'type': 'ManyToMany',
                        'sourceEntity': rel.get('Entity1LogicalName'),
                        'targetEntity': rel.get('Entity2LogicalName'),
                        'intersectEntity': rel.get('IntersectEntityName'),
                        'entity1Attribute': rel.get('Entity1IntersectAttribute'),
                        'entity2Attribute': rel.get('Entity2IntersectAttribute'),
                    }
                    relationships.append(relationship_obj)

            self.logger.info(f"Processed {len(relationships)} relationships")
            return {'relationships': relationships}

        except Exception as e:
            self.logger.error(f"Error in get_all_relationships_consolidated: {e}")
            raise e

    def get_entity_graph_data(self) -> Dict[str, Any]:
        """
        Get complete graph data with entities and relationships

        :return: Dictionary containing nodes (entities) and edges (relationships)
        """
        try:
            entities = self.get_all_entities()
            relationships_data = self.get_all_relationships_consolidated()

            return {
                'nodes': entities,
                'edges': relationships_data['relationships']
            }

        except Exception as e:
            self.logger.error(f"Error in get_entity_graph_data: {e}")
            raise e
