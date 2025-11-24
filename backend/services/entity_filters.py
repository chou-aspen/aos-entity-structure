"""
Filters for excluding system/metadata entities from visualization
"""

# System entities that are backend/metadata and not user-facing business entities
SYSTEM_ENTITIES = {
    # User tracking and metadata
    'systemuser',
    'team',
    'businessunit',
    'owner',
    'principal',
    'principalobjectattributeaccess',

    # Audit and tracking
    'audit',
    'userentityinstancedata',
    'userentityuisettings',
    'userquery',
    'userqueryvisualization',
    'usersettings',
    'userfiscalcalendar',
    'userapplicationmetadata',
    'userrating',
    'userentityinstancedata',

    # Duplicate detection
    'duplicaterecord',
    'duplicaterule',
    'duplicaterulecondition',

    # System jobs and processes
    'asyncoperation',
    'processsession',
    'workflowlog',
    'processtrigger',
    'workflow',
    'workflowdependency',

    # Sync and integration
    'syncerror',
    'importfile',
    'importdata',
    'importlog',
    'importmap',
    'import',

    # Bulk operations
    'bulkdeletefailure',
    'bulkdeleteoperation',
    'bulkoperation',
    'bulkoperationlog',

    # Mailbox tracking
    'mailboxtrackingfolder',
    'mailboxtrackingcategory',

    # Deleted items
    'deleteditemreference',

    # Organization settings
    'organization',
    'organizationui',
    'organizationsetting',

    # Solution and customization metadata
    'solution',
    'solutioncomponent',
    'publisher',
    'dependency',
    'dependencynode',
    'invaliddependency',

    # Entity metadata
    'entity',
    'attribute',
    'attributemap',
    'entitymap',
    'relationship',
    'optionset',

    # Plugins and SDK
    'sdkmessage',
    'sdkmessagefilter',
    'sdkmessageprocessingstep',
    'sdkmessageprocessingstepimage',
    'sdkmessagerequest',
    'sdkmessagerequestfield',
    'sdkmessageresponse',
    'sdkmessageresponsefield',
    'pluginassembly',
    'plugintype',
    'plugintypestatistic',
    'plugintracelog',
    'serviceendpoint',

    # Security and privileges
    'privilege',
    'role',
    'roleprivileges',
    'systemuserroles',
    'teamroles',
    'fieldsecurityprofile',
    'principalobjectaccess',

    # Saved queries and views (system)
    'savedquery',
    'savedqueryvisualization',

    # App metadata
    'appmodule',
    'appmodulecomponent',
    'appmoduleroles',
    'appconfig',
    'appconfiginstance',
    'appconfigmaster',

    # Web resources
    'webresource',
    'ribboncommand',
    'ribboncontextgroup',
    'ribboncustomization',
    'ribbondiff',
    'ribbonrule',
    'ribbontabtocommandmap',

    # Site map
    'sitemap',

    # Trace and diagnostics
    'tracelog',
    'trace',

    # Calendar and fiscal
    'calendar',
    'calendarrule',
    'annualfiscalcalendar',
    'fixedmonthlyfiscalcalendar',
    'monthlyfiscalcalendar',
    'quarterlyfiscalcalendar',
    'semiannualfiscalcalendar',

    # Recurring appointments
    'recurringappointmentmaster',

    # Transaction currency base
    'transactioncurrency',
    'transactioncurrencyexchangerate',

    # Subject tree
    'subject',

    # Templates (system)
    'template',
    'kbarticletemplate',
    'contracttemplate',

    # Email templates might be kept depending on use case
    # 'emailtemplate',

    # Display strings and localization
    'displaystring',
    'displaystringmap',
    'languagelocale',
    'languageprovisioningstate',

    # Queue items
    'queueitem',

    # Activity pointer (base class, not directly used)
    'activitypointer',

    # Activity party (internal join table)
    'activityparty',

    # Attachment base
    'activitymimeattachment',
    'attachment',

    # File attachment metadata
    'fileattachment',

    # Team templates
    'teamtemplate',

    # Connection roles
    'connectionrole',
    'connectionroleassociation',
    'connectionroleobjecttypecode',

    # Process stages
    'processstage',

    # Business process flow
    'businessprocessflowinstance',

    # Workflow binary
    'workflowbinary',

    # Mobile offline
    'mobileofflineprofile',
    'mobileofflineprofileitem',

    # Navigation settings
    'navigationsetting',

    # Similarity rules
    'similarityrule',
    'advancedsimilarityrule',

    # Text analytics
    'textanalyticsentitymapping',
    'topicmodel',
    'topicmodelconfiguration',
    'topicmodelexecutionhistory',
    'knowledgesearchmodel',

    # Hierarchy security
    'hierarchysecurityconfiguration',
    'hierarchyrule',

    # Customizations
    'customcontrol',
    'customcontroldefaultconfig',
    'customcontrolresource',

    # Entity key
    'entitykey',

    # Field permissions
    'fieldpermission',

    # Position (org hierarchy)
    'position',

    # Report
    'reportcategory',
    'reportentity',
    'reportlink',
    'reportvisibility',

    # System forms
    'systemform',

    # System charts
    'systemchart',

    # Metadata changes
    'attributeimageconfig',
    'entityimageconfig',

    # App notifications
    'appnotification',

    # Archive
    'archivecleanupinfo',
    'archivecleanupoperation',

    # Catalog
    'catalog',
    'catalogassignment',

    # Channel access
    'channelaccessprofile',
    'channelaccessprofilerule',

    # Elastic file attachments
    'elasticfileattachment',

    # Metadata
    'attributemetadata',
    'entitymetadata',
    'globaloptionsetmetadata',
    'optionsetmetadata',
    'relationshipmetadata',

    # Package
    'package',

    # Provision language
    'provisionlanguageforuser',

    # Record image
    'recordimage',

    # Recycle bin
    'recyclebinconfig',

    # Retention
    'retentionconfig',
    'retentionfailuredetail',
    'retentionoperation',
    'retentionoperationdetail',

    # Search
    'searchattributesettings',
    'searchcustomanalyzer',
    'searchrelationshipsettings',

    # Settings
    'setting',
    'settingdefinition',

    # Status maps
    'statusmap',
    'stringmap',

    # Subscription
    'subscriptionclients',
    'subscriptionsyncinfo',
    'subscriptionstatisticsoffline',
    'subscriptionstatisticsoutlook',

    # Time zone
    'timezonedefinition',
    'timezonelocalizedname',
    'timezonerule',

    # Virtual entity
    'virtualentitymetadata',

    # Web wizard
    'webwizard',
}

def is_business_entity(entity: dict) -> bool:
    """
    Determine if an entity is a business entity (user-facing)
    rather than a system/metadata entity

    Args:
        entity: Entity dictionary with 'logicalName' and 'isCustomEntity' fields

    Returns:
        True if this is a business entity, False if it's a system entity
    """
    logical_name = entity.get('logicalName', '').lower()

    # All custom entities are considered business entities
    if entity.get('isCustomEntity', False):
        return True

    # Check if it's in the system entities list
    if logical_name in SYSTEM_ENTITIES:
        return False

    # Keep standard business entities like:
    # - account, contact, lead, opportunity
    # - email, phonecall, task, appointment (if not activity pointer)
    # - case, campaign, etc.
    return True


def filter_business_entities(entities: list, relationships: list) -> tuple:
    """
    Filter entities and relationships to only include business entities

    Args:
        entities: List of entity dictionaries
        relationships: List of relationship dictionaries

    Returns:
        Tuple of (filtered_entities, filtered_relationships)
    """
    # Filter entities
    business_entities = [e for e in entities if is_business_entity(e)]
    business_entity_names = {e['id'] for e in business_entities}

    # Filter relationships to only those between business entities
    business_relationships = [
        r for r in relationships
        if r['sourceEntity'] in business_entity_names
        and r['targetEntity'] in business_entity_names
    ]

    return business_entities, business_relationships

# Core business entities to always include
CORE_BUSINESS_ENTITIES = {
    # Core CRM
    'account',
    'contact',
    'systemuser',  # Include users for team visualization
    'msdyn_project',  # Include Project entity (L2 hierarchy)

    # Activities
    'email',
    'phonecall',
    'task',
    'appointment',
    'letter',
    'fax',
}

def filter_core_and_custom_entities(entities: list, relationships: list, include_prefixes: list = None) -> tuple:
    """
    Filter to show only core business entities + custom entities with specific prefixes
    
    Option 2: Shows ~620 entities (8 core + 612 custom) - Recommended for visualization
    
    Args:
        entities: List of entity dictionaries
        relationships: List of relationship dictionaries
        include_prefixes: List of custom prefixes to include (e.g., ['qrt_', 'msdyn_'])
                         If None, includes all custom entities
    
    Returns:
        Tuple of (filtered_entities, filtered_relationships)
    """
    if include_prefixes is None:
        include_prefixes = []  # Will include all custom entities
    
    filtered_entities = []
    
    for entity in entities:
        logical_name = entity.get('logicalName', '').lower()
        
        # Include if it's a core business entity
        if logical_name in CORE_BUSINESS_ENTITIES:
            filtered_entities.append(entity)
            continue
        
        # Include if it's a custom entity
        if entity.get('isCustomEntity', False):
            # If no prefixes specified, include all custom entities
            if not include_prefixes:
                filtered_entities.append(entity)
            else:
                # Only include if it matches one of the specified prefixes
                if any(logical_name.startswith(prefix.lower()) for prefix in include_prefixes):
                    filtered_entities.append(entity)
    
    # Get entity names
    entity_names = {e['id'] for e in filtered_entities}
    
    # Filter relationships
    filtered_relationships = [
        r for r in relationships
        if r['sourceEntity'] in entity_names and r['targetEntity'] in entity_names
    ]
    
    return filtered_entities, filtered_relationships
