"""
Export BUSINESS entities only (filtered) to see what we're actually visualizing
"""
import json
import csv
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))
from dynamics_api.dynamics_api import DynamicsAPI
from backend.services.dynamics_service import DynamicsService
from backend.services.entity_filters import filter_business_entities

def export_business_data():
    """Export business entities only"""
    print("Fetching data from Dynamics 365...")
    service = DynamicsService()

    # Get all data
    graph_data = service.get_entity_graph_data()
    print(f"  Raw data: {len(graph_data['nodes'])} entities, {len(graph_data['edges'])} relationships")

    # Filter to business entities only
    business_nodes, business_edges = filter_business_entities(
        graph_data['nodes'],
        graph_data['edges']
    )

    print(f"  Business entities: {len(business_nodes)} entities, {len(business_edges)} relationships")

    # Save to JSON
    business_data = {
        'nodes': business_nodes,
        'edges': business_edges
    }

    output_file = 'business_entities.json'
    with open(output_file, 'w') as f:
        json.dump(business_data, f, indent=2)

    print(f"\n✓ Exported to {output_file}")

    return business_nodes, business_edges

def create_business_summary(entities, relationships):
    """Create summary of business entities"""
    output_file = 'BUSINESS_ENTITY_SUMMARY.md'

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
    standard_count = len(entities) - custom_count

    # Categorize standard entities
    standard_entities = [e for e in entities if not e['isCustomEntity']]
    standard_by_category = {
        'Core Business': [],
        'Activities': [],
        'Sales': [],
        'Service': [],
        'Marketing': [],
        'Other': []
    }

    for e in standard_entities:
        name = e['logicalName'].lower()
        label = e['label']

        # Categorize
        if e['isActivity']:
            standard_by_category['Activities'].append(e)
        elif name in ['account', 'contact']:
            standard_by_category['Core Business'].append(e)
        elif name in ['lead', 'opportunity', 'quote', 'salesorder', 'invoice', 'competitor', 'product', 'pricelevel', 'discount']:
            standard_by_category['Sales'].append(e)
        elif name in ['incident', 'case', 'contract', 'entitlement', 'kbarticle', 'knowledgearticle']:
            standard_by_category['Service'].append(e)
        elif name in ['campaign', 'campaignactivity', 'list', 'bulkoperation', 'campaignresponse', 'marketinglist']:
            standard_by_category['Marketing'].append(e)
        else:
            standard_by_category['Other'].append(e)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Business Entities Summary (System Entities Filtered Out)\n\n")

        f.write("## Overview\n\n")
        f.write(f"- **Total Business Entities**: {len(entities)}\n")
        f.write(f"- **Custom Entities**: {custom_count}\n")
        f.write(f"- **Standard Business Entities**: {standard_count}\n")
        f.write(f"- **Activity Entities**: {activity_count}\n")
        f.write(f"- **Business Relationships**: {len(relationships)}\n\n")

        f.write("## What Was Filtered Out?\n\n")
        f.write("System entities removed (144 entities):\n")
        f.write("- User tracking: `systemuser`, `team`, `businessunit`\n")
        f.write("- Audit/metadata: `audit`, `duplicaterecord`, `syncerror`\n")
        f.write("- System jobs: `asyncoperation`, `processsession`, `bulkdeletefailure`\n")
        f.write("- Backend tracking: `mailboxtrackingfolder`, `principalobjectattributeaccess`\n")
        f.write("- Solution/customization metadata\n")
        f.write("- Plugin/SDK entities\n\n")

        f.write("## Top 20 Most Connected Business Entities\n\n")
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

        f.write("\n## Standard Business Entities by Category\n\n")

        for category, cat_entities in standard_by_category.items():
            if cat_entities:
                f.write(f"### {category} ({len(cat_entities)} entities)\n\n")
                f.write("| Logical Name | Label | Relationships |\n")
                f.write("|--------------|-------|---------------|\n")
                for e in sorted(cat_entities, key=lambda x: x['label'])[:20]:
                    rel_count = entity_rel_count.get(e['logicalName'], 0)
                    f.write(f"| {e['logicalName']} | {e['label']} | {rel_count} |\n")
                if len(cat_entities) > 20:
                    f.write(f"\n*... and {len(cat_entities) - 20} more {category.lower()} entities*\n")
                f.write("\n")

        f.write("## Custom Entities (Top 50)\n\n")
        f.write("| Logical Name | Label | Relationships | Description |\n")
        f.write("|--------------|-------|---------------|-------------|\n")

        custom_entities = [e for e in entities if e['isCustomEntity']]
        sorted_custom = sorted(
            custom_entities,
            key=lambda e: entity_rel_count.get(e['logicalName'], 0),
            reverse=True
        )[:50]

        for entity in sorted_custom:
            rel_count = entity_rel_count.get(entity['logicalName'], 0)
            desc = entity.get('description', '')[:80]
            f.write(f"| {entity['logicalName']} | {entity['label']} | {rel_count} | {desc} |\n")

        if len(custom_entities) > 50:
            f.write(f"\n*... and {len(custom_entities) - 50} more custom entities*\n")

    print(f"✓ Created summary in {output_file}")

def export_business_csv(entities, relationships):
    """Export business entities to CSV"""
    # Entities CSV
    with open('business_entities.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'LogicalName', 'Label', 'SchemaName', 'IsCustomEntity',
            'IsActivity', 'Description'
        ])
        writer.writeheader()

        for entity in entities:
            writer.writerow({
                'LogicalName': entity['logicalName'],
                'Label': entity['label'],
                'SchemaName': entity['schemaName'],
                'IsCustomEntity': entity['isCustomEntity'],
                'IsActivity': entity['isActivity'],
                'Description': entity.get('description', '')
            })

    print("✓ Exported to business_entities.csv")

    # Relationships CSV
    with open('business_relationships.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'SchemaName', 'Type', 'SourceEntity', 'TargetEntity',
            'SourceAttribute', 'TargetAttribute'
        ])
        writer.writeheader()

        for rel in relationships:
            writer.writerow({
                'SchemaName': rel['schemaName'],
                'Type': rel['type'],
                'SourceEntity': rel['sourceEntity'],
                'TargetEntity': rel['targetEntity'],
                'SourceAttribute': rel.get('sourceAttribute', ''),
                'TargetAttribute': rel.get('targetAttribute', '')
            })

    print("✓ Exported to business_relationships.csv")

if __name__ == "__main__":
    print("=" * 60)
    print("Business Entity Exporter (System Entities Filtered)")
    print("=" * 60)

    # Export data
    entities, relationships = export_business_data()

    # Create summary
    create_business_summary(entities, relationships)

    # Export CSVs
    export_business_csv(entities, relationships)

    print("\n" + "=" * 60)
    print("Export Complete!")
    print("=" * 60)
    print("\nGenerated files:")
    print("  1. BUSINESS_ENTITY_SUMMARY.md   - Categorized summary")
    print("  2. business_entities.csv        - Business entities only")
    print("  3. business_relationships.csv   - Business relationships only")
    print("  4. business_entities.json       - Complete data in JSON")
