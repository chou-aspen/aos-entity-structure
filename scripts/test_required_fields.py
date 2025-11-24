#!/usr/bin/env python3
"""Test script to verify required fields API returns correct format"""

import sys
sys.path.insert(0, '/home/chou/AOS/aos-entity-structure')

from dynamics_api.dynamics_api import DynamicsAPI
import json

def test_required_fields():
    api = DynamicsAPI()

    print("Testing get_entity_required_attributes for 'account'...")
    result = api.get_entity_required_attributes('account')

    print(f"\nResult type: {type(result)}")
    print(f"Result length: {len(result)}")

    if result:
        print(f"\nFirst item type: {type(result[0])}")
        print(f"First item: {json.dumps(result[0], indent=2)}")

        if len(result) > 1:
            print(f"\nSecond item: {json.dumps(result[1], indent=2)}")

    print("\n" + "="*50)
    print("Full result:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_required_fields()
