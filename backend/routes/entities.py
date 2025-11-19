"""
API routes for entity and relationship operations
"""
from fastapi import APIRouter, HTTPException, Query
import logging
from services.dynamics_service import DynamicsService
from services.entity_filters import filter_business_entities, filter_core_and_custom_entities

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize service
dynamics_service = DynamicsService()


@router.get("/entities")
async def get_entities():
    """
    Get all entity definitions from Dynamics 365

    Returns:
        List of entity objects with metadata
    """
    try:
        logger.info("Fetching all entities")
        entities = dynamics_service.get_all_entities()
        return {"entities": entities, "count": len(entities)}
    except Exception as e:
        logger.error(f"Error fetching entities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/relationships")
async def get_relationships():
    """
    Get all relationships between entities

    Returns:
        List of relationship objects
    """
    try:
        logger.info("Fetching all relationships")
        relationships = dynamics_service.get_all_relationships_consolidated()
        return {
            "relationships": relationships['relationships'],
            "count": len(relationships['relationships'])
        }
    except Exception as e:
        logger.error(f"Error fetching relationships: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph")
async def get_graph_data(
    filter_mode: str = Query("core_custom", description="Filter mode: 'core_custom' (default, ~620 entities), 'business' (~820 entities), 'custom' (~612 entities), 'all' (964 entities)"),
    prefixes: str = Query(None, description="Comma-separated prefixes to include (e.g., 'qrt_,msdyn_'). Only works with core_custom mode."),
    limit: int = Query(None, description="Limit number of entities returned")
):
    """
    Get complete graph data with entities and relationships

    Query Parameters:
        filter_mode: Choose filter mode:
            - 'core_custom' (DEFAULT): Core CRM entities + all custom entities (~620 entities, RECOMMENDED)
            - 'business': All business entities, exclude system/backend (~820 entities)
            - 'custom': Only custom entities (~612 entities)
            - 'all': All entities (964 entities, may be slow)

        prefixes: Comma-separated list of prefixes (only for core_custom mode)
                 Example: 'qrt_,msdyn_' to include only qrt_ and msdyn_ custom entities

        limit: Limit number of entities (e.g., 100 for testing)

    Returns:
        Dictionary containing nodes and edges for graph visualization

    Examples:
        /api/graph - Default: Core + all custom entities
        /api/graph?filter_mode=core_custom&prefixes=qrt_,msdyn_ - Core + specific prefixes only
        /api/graph?filter_mode=business - All business entities
        /api/graph?limit=50 - First 50 entities
    """
    try:
        logger.info(f"Fetching graph data (filter_mode={filter_mode}, prefixes={prefixes}, limit={limit})")
        graph_data = dynamics_service.get_entity_graph_data()

        # Apply filter based on mode
        if filter_mode == "core_custom":
            # Option 2: Core + Custom (RECOMMENDED)
            prefix_list = prefixes.split(',') if prefixes else None
            filtered_nodes, filtered_edges = filter_core_and_custom_entities(
                graph_data['nodes'],
                graph_data['edges'],
                include_prefixes=prefix_list
            )
            graph_data['nodes'] = filtered_nodes
            graph_data['edges'] = filtered_edges
            logger.info(f"Core+Custom filter: {len(filtered_nodes)} entities, {len(filtered_edges)} relationships")

        elif filter_mode == "business":
            # Business entities only (exclude system/metadata)
            filtered_nodes, filtered_edges = filter_business_entities(
                graph_data['nodes'],
                graph_data['edges']
            )
            graph_data['nodes'] = filtered_nodes
            graph_data['edges'] = filtered_edges
            logger.info(f"Business filter: {len(filtered_nodes)} entities, {len(filtered_edges)} relationships")

        elif filter_mode == "custom":
            # Custom entities only
            filtered_nodes = [n for n in graph_data['nodes'] if n['isCustomEntity']]
            custom_entity_names = {n['id'] for n in filtered_nodes}
            filtered_edges = [
                e for e in graph_data['edges']
                if e['sourceEntity'] in custom_entity_names and e['targetEntity'] in custom_entity_names
            ]
            graph_data['nodes'] = filtered_nodes
            graph_data['edges'] = filtered_edges
            logger.info(f"Custom filter: {len(filtered_nodes)} entities, {len(filtered_edges)} relationships")

        elif filter_mode == "all":
            logger.info(f"No filter: {len(graph_data['nodes'])} entities, {len(graph_data['edges'])} relationships")

        else:
            raise HTTPException(status_code=400, detail=f"Invalid filter_mode: {filter_mode}")

        # Apply limit if specified
        if limit and limit > 0:
            graph_data['nodes'] = graph_data['nodes'][:limit]
            limited_entity_names = {n['id'] for n in graph_data['nodes']}
            graph_data['edges'] = [
                e for e in graph_data['edges']
                if e['sourceEntity'] in limited_entity_names and e['targetEntity'] in limited_entity_names
            ]
            logger.info(f"Limited to {len(graph_data['nodes'])} entities, {len(graph_data['edges'])} relationships")

        return {
            "nodes": graph_data['nodes'],
            "edges": graph_data['edges'],
            "nodeCount": len(graph_data['nodes']),
            "edgeCount": len(graph_data['edges'])
        }
    except Exception as e:
        logger.error(f"Error fetching graph data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
