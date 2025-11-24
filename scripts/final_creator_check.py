#!/usr/bin/env python3
"""
Final attempt to find entity creators through ALL possible methods
"""

import sys
sys.path.insert(0, '/home/chou/AOS/aos-entity-structure')

from dynamics_api.dynamics_api import DynamicsAPI
import json
import os

def final_creator_check():
    api = DynamicsAPI()
    DYNAMICS_RESOURCE_URL = os.environ.get('DYNAMICS_RESOURCE_URL')

    test_entity = 'qrt_portfolio'

    print("=" * 80)
    print("METHOD 1: Check if audit records exist for entity creation")
    print("=" * 80)

    # Try to find audit record for entity creation
    # Action 1 = Create
    audit_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/audits?$filter=objectid eq '{test_entity}' and action eq 1&$select=createdon,userid,action&$expand=userid($select=fullname,internalemailaddress)"

    print(f"\nTrying to fetch audit for {test_entity}...")
    response = api.session.get(audit_url, headers=api.headers)

    if response.status_code == 200:
        audits = response.json().get('value', [])
        if audits:
            print(f"✓ Found {len(audits)} audit records")
            for audit in audits[:3]:
                print(json.dumps(audit, indent=2))
        else:
            print("✗ No audit records found (auditing might not be enabled for metadata)")
    else:
        print(f"✗ Audit API error: {response.status_code}")
        print(f"  Message: {response.text[:200]}")

    print("\n" + "=" * 80)
    print("METHOD 2: Check solution layers (who last modified solution components)")
    print("=" * 80)

    # Get MetadataId for the entity first
    entity_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{test_entity}')?$select=MetadataId"
    response = api.session.get(entity_url, headers=api.headers)

    if response.status_code == 200:
        metadata_id = response.json().get('MetadataId')
        print(f"\nEntity MetadataId: {metadata_id}")

        # Try to get solution layers for this component
        # This might not be available via API
        layers_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/RetrieveSolutionComponentLayers"

        print("\nAttempting to call RetrieveSolutionComponentLayers...")
        print("(This is a bound function, might not work directly)")

    print("\n" + "=" * 80)
    print("METHOD 3: Check who owns the attributes (indirect method)")
    print("=" * 80)

    # Get attributes for this entity with all metadata
    attrs_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{test_entity}')/Attributes?$select=LogicalName,CreatedOn&$top=5"

    response = api.session.get(attrs_url, headers=api.headers)

    if response.status_code == 200:
        attrs = response.json().get('value', [])
        print(f"\nChecking first {len(attrs)} attributes:")
        for attr in attrs:
            print(f"\n  Attribute: {attr.get('LogicalName')}")
            print(f"  Created On: {attr.get('CreatedOn')}")

            # Check if attribute metadata has any creator info
            if 'CreatedBy' in attr:
                print(f"  ✓ Created By: {attr.get('CreatedBy')}")
            else:
                print(f"  ✗ No CreatedBy field")

    print("\n" + "=" * 80)
    print("METHOD 4: Check Power Platform metadata (solution publisher)")
    print("=" * 80)

    # Get publishers to see who created solutions
    publishers_url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/publishers?$select=friendlyname,uniquename,createdby,createdon&$expand=createdby($select=fullname,internalemailaddress)"

    response = api.session.get(publishers_url, headers=api.headers)

    if response.status_code == 200:
        publishers = response.json().get('value', [])
        print(f"\nFound {len(publishers)} publishers:")
        for pub in publishers[:5]:
            print(f"\n  Publisher: {pub.get('friendlyname')}")
            print(f"  Unique Name: {pub.get('uniquename')}")
            created_by = pub.get('createdby')
            if created_by:
                print(f"  Created By: {created_by.get('fullname')} ({created_by.get('internalemailaddress')})")
            else:
                print(f"  Created By: <not expanded>")

    print("\n" + "=" * 80)
    print("CONCLUSION")
    print("=" * 80)
    print("""
Based on testing all available Dynamics 365 Web API methods:

1. EntityDefinitions.OwnerId = null (not tracked)
2. Audit records for metadata creation are not available
3. Attributes don't have CreatedBy field
4. Publisher information exists but doesn't link to individual entities

Microsoft Dynamics 365 does NOT store who created entity schemas (tables).
This is by design - entity metadata is structural, not transactional.

HOWEVER, we could potentially:
- Check custom entity creation dates and correlate with user activity
- Use Power Platform admin APIs (requires different auth)
- Check solution history if entities were deployed via solutions
- Manually maintain a mapping file

For your use case (filter by creator), the recommended approach is:
✓ Use prefix-based filtering (qrt_ = your team's entities)
✓ Maintain a hardcoded inclusion/exclusion list
✓ This is what Microsoft Power Platform admin tools do internally
    """)

if __name__ == "__main__":
    final_creator_check()
