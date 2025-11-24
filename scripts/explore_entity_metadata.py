#!/usr/bin/env python3
"""
Explore entity metadata to find creator information
"""

import sys
sys.path.insert(0, '/home/chou/AOS/aos-entity-structure')

from dynamics_api.dynamics_api import DynamicsAPI
import json

def explore_entity_metadata():
    api = DynamicsAPI()

    # Get base URL from environment
    import os
    DYNAMICS_RESOURCE_URL = os.environ.get('DYNAMICS_RESOURCE_URL')

    print("=" * 80)
    print("Step 1: Fetching EntityDefinitions with ALL metadata fields")
    print("=" * 80)

    # Try to get full metadata for a single custom entity
    test_entity = 'qrt_portfolio'

    # Query with $select=* to get ALL fields
    url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{test_entity}')"

    print(f"\nFetching full metadata for: {test_entity}")
    print(f"URL: {url}")

    response = api.session.get(url, headers=api.headers)

    if response.status_code == 200:
        data = response.json()

        print("\n" + "=" * 80)
        print("Available Fields in EntityDefinition:")
        print("=" * 80)

        # Print all top-level keys
        for key in sorted(data.keys()):
            value = data[key]
            if isinstance(value, (str, int, bool, type(None))):
                print(f"{key}: {value}")
            elif isinstance(value, dict):
                print(f"{key}: <dict with {len(value)} keys>")
                # Check if it looks like creator info
                if any(creator_hint in key.lower() for creator_hint in ['create', 'owner', 'modified', 'author']):
                    print(f"  -> {json.dumps(value, indent=4)}")
            elif isinstance(value, list):
                print(f"{key}: <list with {len(value)} items>")
            else:
                print(f"{key}: <{type(value).__name__}>")

        print("\n" + "=" * 80)
        print("Step 2: Checking fields that might contain creator info")
        print("=" * 80)

        creator_related_fields = [
            'CreatedBy', 'CreatedOn', 'ModifiedBy', 'ModifiedOn',
            'OwnerIdName', 'OwnerId', 'CreatedOnBehalfBy',
            'ModifiedOnBehalfBy', 'IntroducedVersion', 'SolutionId',
            'PublisherId', 'IsManaged', 'IsCustomizable'
        ]

        print("\nSearching for creator-related fields:")
        for field in creator_related_fields:
            if field in data:
                print(f"\n✓ Found: {field}")
                print(f"  Value: {json.dumps(data[field], indent=4)}")
            else:
                print(f"✗ Not found: {field}")

        # Save full response for review
        with open('/tmp/entity_full_metadata.json', 'w') as f:
            json.dump(data, f, indent=2)
        print(f"\n\nFull metadata saved to: /tmp/entity_full_metadata.json")

    else:
        print(f"Error: {response.status_code}")
        print(response.text)

    print("\n" + "=" * 80)
    print("Step 3: Checking Solution metadata (alternative approach)")
    print("=" * 80)

    # Check if we can get solution/publisher info
    solutions_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/solutions?$select=uniquename,friendlyname,publisherid,createdby,createdon&$filter=ismanaged eq false"

    print(f"\nFetching solutions...")
    response = api.session.get(solutions_url, headers=api.headers)

    if response.status_code == 200:
        solutions = response.json().get('value', [])
        print(f"\nFound {len(solutions)} unmanaged solutions:")
        for sol in solutions[:5]:  # Show first 5
            print(f"\n  Solution: {sol.get('friendlyname')}")
            print(f"    Unique Name: {sol.get('uniquename')}")
            print(f"    Created On: {sol.get('createdon')}")
            # Note: createdby is usually a GUID, need to expand to get name

    print("\n" + "=" * 80)
    print("Step 4: Fetching entity with expanded metadata")
    print("=" * 80)

    # Try to get metadata with expanded fields
    expanded_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{test_entity}')?$expand=Attributes($select=LogicalName,CreatedOn)"

    print(f"\nFetching with $expand...")
    response = api.session.get(expanded_url, headers=api.headers)

    if response.status_code == 200:
        print("✓ Successfully fetched expanded metadata")
        # Check if attributes have creator info
        data = response.json()
        if 'Attributes' in data and len(data['Attributes']) > 0:
            sample_attr = data['Attributes'][0]
            print(f"\nSample attribute metadata:")
            print(json.dumps(sample_attr, indent=2))

if __name__ == "__main__":
    explore_entity_metadata()
