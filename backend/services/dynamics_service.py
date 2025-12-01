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
    def should_include_entity(logical_name: str, is_custom: bool) -> bool:
        """
        Determine if an entity should be included based on filtering criteria.

        Include:
        - All qrt_ custom entities (created by team)
        - System entities: account, contact, systemuser

        Exclude (hardcoded):
        - Task Configuration, Task Rules, Bid Issuance, Submittals, etc.

        :param logical_name: The logical name of the entity
        :param is_custom: Whether the entity is custom
        :return: True if entity should be included
        """
        logical_name_lower = logical_name.lower()

        # Hardcoded exclusion list
        excluded_entities = {
            'qrt_taskconfiguration',  # Task Configuration
            'qrt_taskrules',  # Task Rules
            'qrt_taskconfigrule',  # Task Config Rule
            'qrt_bidissuance',  # Bid Issuance
            'qrt_submittals',  # Submittals
            'qrt_assetcontract',  # Asset Contracts
            'qrt_bidpackage',  # Bid Package
            'qrt_bidpackage_account',  # Bid Package junction
            'qrt_bidpackage_msdyn_project',  # Bid Package junction
            'qrt_departmentheadsmeetingagenda',  # Department Heads Meeting Agenda
            'qrt_flowconfiguration',  # Flow Config
            'task',  # System task entity
        }

        # If in exclusion list, reject immediately
        if logical_name_lower in excluded_entities:
            return False

        # Include required system and Microsoft entities
        required_entities = {'account', 'contact', 'systemuser', 'msdyn_project'}
        if logical_name_lower in required_entities:
            return True

        # Include all qrt_ custom entities (created by team: meldin/teng/SA1/SA2)
        if logical_name_lower.startswith('qrt_'):
            return True

        # Exclude all other entities
        return False

    @staticmethod
    def get_hierarchy_level(logical_name: str) -> int:
        """
        Determine the hierarchy level of an entity for tree visualization

        Hierarchy Levels (matching tree layout ranks 0-4):
        Level 0: System entities (contact, systemuser) - First/Top
        Level 1: account - Second level
        Level 2: qrt_portfolio, msdyn_project - Third level (Portfolio/Project)
        Level 3: Child entities - Fourth level
        Level 4: Other qrt_ entities - Fifth/Bottom level (returned as 0, mapped to 4 in frontend)

        :param logical_name: The logical name of the entity
        :return: Hierarchy level (0, 1, 2, 3, or 4 for default/other)
        """
        logical_name = logical_name.lower()

        # Level 0: System entities (contact, systemuser) - FIRST/TOP
        if logical_name in ['contact', 'systemuser']:
            return 0

        # Level 1: Account - SECOND
        if logical_name == 'account':
            return 1

        # Level 2: Portfolio/Project level - THIRD
        if logical_name in ['qrt_portfolio', 'msdyn_project']:
            return 2

        # Level 3: Child entities - FOURTH
        child_entities = [
            'qrt_agreements',
            'qrt_bonds',
            'qrt_designrequests',
            'qrt_epca',
            'qrt_estimateresquests',  # Fixed: was qrt_estimaterequests
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

        # Level 4: Other qrt_ entities - FIFTH/BOTTOM (default 4)
        return 4

    def get_all_entities(self) -> List[Dict[str, Any]]:
        """
        Fetch all entity definitions and format them for the frontend

        :return: List of entity objects with id, label, type, and metadata
        """
        try:
            import time
            start_time = time.time()

            raw_entities = self.dynamics_api.get_all_entity_definitions()
            entities = []

            self.logger.info(f"Fetching required fields for {len(raw_entities.get('value', []))} entities...")

            for entity in raw_entities.get('value', []):
                logical_name = entity.get('LogicalName')
                is_custom = entity.get('IsCustomEntity', False)

                # Apply filtering: only include entities created by team + system entities
                if not self.should_include_entity(logical_name, is_custom):
                    continue

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

                hierarchy_level = self.get_hierarchy_level(logical_name)

                # Only fetch required fields for hierarchy levels 1, 2, and 3
                # (Account, Portfolio/Project, and Child entities)
                required_fields = []
                if hierarchy_level in [1, 2, 3]:
                    required_fields = self.dynamics_api.get_entity_required_attributes(logical_name)

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
                    'hierarchyLevel': hierarchy_level,
                    'requiredFields': required_fields
                }
                entities.append(entity_obj)

            end_time = time.time()
            elapsed_time = end_time - start_time
            self.logger.info(f"Processed {len(entities)} entities with required fields in {elapsed_time:.2f} seconds")
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
