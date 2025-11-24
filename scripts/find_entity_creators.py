#!/usr/bin/env python3
"""
Find entity creators through solution components
"""

import sys
sys.path.insert(0, '/home/chou/AOS/aos-entity-structure')

from dynamics_api.dynamics_api import DynamicsAPI
import json
import os

def find_entity_creators():
    api = DynamicsAPI()
    DYNAMICS_RESOURCE_URL = os.environ.get('DYNAMICS_RESOURCE_URL')

    print("=" * 80)
    print("Approach: Check solution components for entity creators")
    print("=" * 80)

    # Get all qrt_ entities
    print("\nStep 1: Getting all qrt_ custom entities...")
    entities_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions?$select=LogicalName,IsCustomEntity,CreatedOn,ModifiedOn&$filter=startswith(LogicalName,'qrt_')"

    response = api.session.get(entities_url, headers=api.headers)
    entities = response.json().get('value', [])

    print(f"Found {len(entities)} qrt_ entities")

    # For each entity, try to find its solution component
    print("\nStep 2: Looking up solution components...")

    sample_entity = entities[0] if entities else None
    if not sample_entity:
        print("No entities found!")
        return

    entity_name = sample_entity['LogicalName']
    print(f"\nTesting with entity: {entity_name}")

    # Try to find solution component for this entity
    # ObjectTypeCode for Entity is 1
    solution_component_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/solutioncomponents?$select=solutionid,componenttype,objectid,createdon&$filter=componenttype eq 1"

    response = api.session.get(solution_component_url, headers=api.headers)

    if response.status_code == 200:
        components = response.json().get('value', [])
        print(f"\nFound {len(components)} entity solution components")

        # Show first few
        for comp in components[:3]:
            print(f"\nComponent:")
            print(f"  Solution ID: {comp.get('solutionid')}")
            print(f"  Object ID: {comp.get('objectid')}")
            print(f"  Created On: {comp.get('createdon')}")

    # Try a different approach: check systemuser table for known users
    print("\n" + "=" * 80)
    print("Step 3: Get list of systemusers to match against")
    print("=" * 80)

    # Search for users: meldin, teng, SA1, SA2
    user_searches = ['meldin', 'teng', 'SA1@aspenpower.com', 'SA2@aspenpower.com']

    for search_term in user_searches:
        users_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/systemusers?$select=systemuserid,fullname,internalemailaddress&$filter=contains(fullname,'{search_term}') or contains(internalemailaddress,'{search_term}')"

        response = api.session.get(users_url, headers=api.headers)

        if response.status_code == 200:
            users = response.json().get('value', [])
            if users:
                print(f"\n✓ Found users matching '{search_term}':")
                for user in users:
                    print(f"  - {user.get('fullname')} ({user.get('internalemailaddress')})")
                    print(f"    ID: {user.get('systemuserid')}")

    # Try to check audit history
    print("\n" + "=" * 80)
    print("Step 4: Check if audit history is available")
    print("=" * 80)

    audit_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/audits?$top=5"

    response = api.session.get(audit_url, headers=api.headers)

    if response.status_code == 200:
        audits = response.json().get('value', [])
        print(f"✓ Audit API accessible - found {len(audits)} records")
    else:
        print(f"✗ Audit API not accessible: {response.status_code}")

if __name__ == "__main__":
    find_entity_creators()
