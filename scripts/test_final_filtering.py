#!/usr/bin/env python3
"""Test the final filtering logic"""

import sys
sys.path.insert(0, '/home/chou/AOS/aos-entity-structure')

from backend.services.dynamics_service import DynamicsService

service = DynamicsService()

print("Testing entity filtering...")
print("=" * 80)

# Simulate fetching entities
from dynamics_api.dynamics_api import DynamicsAPI
import os

api = DynamicsAPI()
DYNAMICS_RESOURCE_URL = os.environ.get('DYNAMICS_RESOURCE_URL')

url = f"{DYNAMICS_RESOURCE_URL}/api/data/v9.2/EntityDefinitions?$select=LogicalName,IsCustomEntity"
response = api.session.get(url, headers=api.headers)
all_entities = response.json().get('value', [])

print(f"Total entities in Dynamics: {len(all_entities)}")

# Apply filter
included = []
excluded = []

for entity in all_entities:
    logical_name = entity['LogicalName']
    is_custom = entity['IsCustomEntity']

    if service.should_include_entity(logical_name, is_custom):
        included.append(logical_name)
    else:
        excluded.append(logical_name)

print(f"\n✓ Entities to INCLUDE: {len(included)}")
print(f"✗ Entities to EXCLUDE: {len(excluded)}")

print(f"\nExpected: 38 entities")
print(f"Actual: {len(included)} entities")

if len(included) == 38:
    print("✓ SUCCESS! Correct number of entities")
else:
    print(f"✗ ERROR! Expected 38 but got {len(included)}")

print(f"\n{'=' * 80}")
print("Included entities:")
print(f"{'=' * 80}")

# Categorize
l1 = [e for e in included if e.lower() == 'account']
l2 = [e for e in included if e.lower() in ['qrt_portfolio', 'msdyn_project']]
l3_entities = [
    'qrt_agreements', 'qrt_bonds', 'qrt_designrequests', 'qrt_epca',
    'qrt_estimateresquests', 'qrt_financerequests', 'qrt_icrequest',
    'qrt_incentives', 'qrt_interconnectionagreementsandpayments',
    'qrt_interconnectionapplicationsstudies', 'qrt_permits',
    'qrt_procurementrequests', 'qrt_sitecontrol', 'qrt_studies',
    'qrt_titleandalta'
]
l3 = [e for e in included if e.lower() in l3_entities]
system = [e for e in included if e.lower() in ['contact', 'systemuser']]
l0 = [e for e in included if e not in l1 + l2 + l3 + system]

print(f"\nL1 (Account - Rose): {len(l1)}")
for e in sorted(l1):
    print(f"  - {e}")

print(f"\nL2 (Portfolio/Project - Cyan): {len(l2)}")
for e in sorted(l2):
    print(f"  - {e}")

print(f"\nL3 (Child Entities - Emerald): {len(l3)}")
for e in sorted(l3):
    print(f"  - {e}")

print(f"\nL0 (Other qrt_ - Purple): {len(l0)}")
for e in sorted(l0):
    print(f"  - {e}")

print(f"\nSystem (Slate): {len(system)}")
for e in sorted(system):
    print(f"  - {e}")

print(f"\nTOTAL: {len(l1)} + {len(l2)} + {len(l3)} + {len(l0)} + {len(system)} = {len(included)}")
