"""
Export Dynamics 365 entities and relationships to JSON and CSV files
"""
import json
import csv
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))
from dynamics_api.dynamics_api import DynamicsAPI
from backend.services.dynamics_service import DynamicsService

def export_to_json():
    """Export entities and relationships to JSON"""
    print("Fetching data from Dynamics 365...")
    service = DynamicsService()

    # Get all data
    graph_data = service.get_entity_graph_data()

    # Save to JSON
    output_file = 'entity_graph_data.json'
    with open(output_file, 'w') as f:
        json.dump(graph_data, f, indent=2)

    print(f"\n✓ Exported to {output_file}")
    print(f"  - Entities: {len(graph_data['nodes'])}")
    print(f"  - Relationships: {len(graph_data['edges'])}")

    return graph_data

def export_entities_csv(entities):
    """Export entities to CSV"""
    output_file = 'entities.csv'

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'LogicalName', 'Label', 'SchemaName', 'EntitySetName',
            'IsCustomEntity', 'IsActivity', 'PrimaryIdAttribute',
            'PrimaryNameAttribute', 'Description'
        ])
        writer.writeheader()

        for entity in entities:
            writer.writerow({
                'LogicalName': entity['logicalName'],
                'Label': entity['label'],
                'SchemaName': entity['schemaName'],
                'EntitySetName': entity['entitySetName'],
                'IsCustomEntity': entity['isCustomEntity'],
                'IsActivity': entity['isActivity'],
                'PrimaryIdAttribute': entity['primaryIdAttribute'],
                'PrimaryNameAttribute': entity['primaryNameAttribute'],
                'Description': entity.get('description', '')
            })

    print(f"\n✓ Exported to {output_file}")

def export_relationships_csv(relationships):
    """Export relationships to CSV"""
    output_file = 'relationships.csv'

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'SchemaName', 'Type', 'SourceEntity', 'TargetEntity',
            'SourceAttribute', 'TargetAttribute', 'IntersectEntity'
        ])
        writer.writeheader()

        for rel in relationships:
            writer.writerow({
                'SchemaName': rel['schemaName'],
                'Type': rel['type'],
                'SourceEntity': rel['sourceEntity'],
                'TargetEntity': rel['targetEntity'],
                'SourceAttribute': rel.get('sourceAttribute', ''),
                'TargetAttribute': rel.get('targetAttribute', ''),
                'IntersectEntity': rel.get('intersectEntity', '')
            })

    print(f"✓ Exported to {output_file}")

def create_entity_summary(entities, relationships):
    """Create a summary markdown file"""
    output_file = 'ENTITY_SUMMARY.md'

    # Count relationships per entity
    entity_rel_count = {}
    for rel in relationships:
        source = rel['sourceEntity']
        target = rel['targetEntity']
        entity_rel_count[source] = entity_rel_count.get(source, 0) + 1
        entity_rel_count[target] = entity_rel_count.get(target, 0) + 1

    # Count custom vs standard
    custom_count = sum(1 for e in entities if e['isCustomEntity'])
    activity_count = sum(1 for e in entities if e['isActivity'])

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Dynamics 365 Entity Structure Summary\n\n")

        f.write("## Overview\n\n")
        f.write(f"- **Total Entities**: {len(entities)}\n")
        f.write(f"- **Custom Entities**: {custom_count}\n")
        f.write(f"- **Standard Entities**: {len(entities) - custom_count}\n")
        f.write(f"- **Activity Entities**: {activity_count}\n")
        f.write(f"- **Total Relationships**: {len(relationships)}\n\n")

        f.write("## Top 20 Most Connected Entities\n\n")
        f.write("| Entity | Label | Type | Relationship Count |\n")
        f.write("|--------|-------|------|--------------------|\n")

        # Sort entities by relationship count
        sorted_entities = sorted(
            entities,
            key=lambda e: entity_rel_count.get(e['logicalName'], 0),
            reverse=True
        )[:20]

        for entity in sorted_entities:
            logical_name = entity['logicalName']
            rel_count = entity_rel_count.get(logical_name, 0)
            entity_type = 'Custom' if entity['isCustomEntity'] else 'Standard'
            f.write(f"| {logical_name} | {entity['label']} | {entity_type} | {rel_count} |\n")

        f.write("\n## Custom Entities\n\n")
        f.write("| Logical Name | Label | Description |\n")
        f.write("|--------------|-------|-------------|\n")

        custom_entities = [e for e in entities if e['isCustomEntity']]
        for entity in sorted(custom_entities, key=lambda e: e['label'])[:50]:  # First 50
            desc = entity.get('description', '')[:100]  # Truncate long descriptions
            f.write(f"| {entity['logicalName']} | {entity['label']} | {desc} |\n")

        if len(custom_entities) > 50:
            f.write(f"\n*... and {len(custom_entities) - 50} more custom entities*\n")

    print(f"✓ Created summary in {output_file}")

if __name__ == "__main__":
    print("=" * 60)
    print("Dynamics 365 Entity & Relationship Exporter")
    print("=" * 60)

    # Export main JSON
    graph_data = export_to_json()

    # Export CSVs
    export_entities_csv(graph_data['nodes'])
    export_relationships_csv(graph_data['edges'])

    # Create summary
    create_entity_summary(graph_data['nodes'], graph_data['edges'])

    print("\n" + "=" * 60)
    print("Export Complete!")
    print("=" * 60)
    print("\nGenerated files:")
    print("  1. entity_graph_data.json  - Complete data in JSON format")
    print("  2. entities.csv            - All entities in CSV")
    print("  3. relationships.csv       - All relationships in CSV")
    print("  4. ENTITY_SUMMARY.md       - Human-readable summary")
