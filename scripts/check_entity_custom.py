#!/usr/bin/env python3
"""
Simple script to check if an entity is custom or system in Dynamics 365
"""
import sys
from pathlib import Path

# Add dynamics_api to path
sys.path.append(str(Path(__file__).parent))
from dynamics_api.dynamics_api import DynamicsAPI
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_entity_type(entity_logical_name: str):
    """Check if an entity is custom or system"""
    try:
        # Initialize Dynamics API
        api = DynamicsAPI(logger=logger)

        print(f"\n{'='*60}")
        print(f"Checking entity: {entity_logical_name}")
        print(f"{'='*60}\n")

        # Fetch all entities
        entities = api.get_all_entity_definitions()

        # Find the specific entity
        entity = None
        for e in entities.get('value', []):
            if e.get('LogicalName', '').lower() == entity_logical_name.lower():
                entity = e
                break

        if not entity:
            print(f"❌ Entity '{entity_logical_name}' not found!")
            return

        # Display entity information
        is_custom = entity.get('IsCustomEntity', False)
        display_name = entity.get('DisplayName', {})
        if isinstance(display_name, dict):
            display_name = display_name.get('UserLocalizedLabel', {}).get('Label', entity_logical_name)

        print(f"Display Name:     {display_name}")
        print(f"Logical Name:     {entity.get('LogicalName')}")
        print(f"IsCustomEntity:   {is_custom}")
        print(f"IsActivity:       {entity.get('IsActivity', False)}")
        print(f"Owner Type:       {entity.get('OwnershipType')}")
        print(f"Schema Name:      {entity.get('SchemaName')}")

        # Determine type
        print(f"\n{'='*60}")
        if is_custom:
            print(f"✅ '{display_name}' is a CUSTOM entity")
        else:
            print(f"🔷 '{display_name}' is a SYSTEM/FIRST-PARTY entity")
        print(f"{'='*60}\n")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Check multiple entities
    entities_to_check = [
        'msdyn_project',      # Plan (Microsoft Project)
        'contact',            # Contact (System)
        'account',            # Account (System)
        'systemuser',         # User (System)
        'qrt_portfolio',      # Portfolio (Custom - created by team)
    ]

    # Allow command-line argument
    if len(sys.argv) > 1:
        entities_to_check = [sys.argv[1]]

    for entity_name in entities_to_check:
        check_entity_type(entity_name)
        print("\n")
