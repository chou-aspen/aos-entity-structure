def create_attribute_payload(
                             attribute_type: str, 
                             attribute_type_name: str, 
                             column_display_name: str, 
                             column_logical_name: str, 
                             additional_properties: dict = {}) -> dict:
    """
    Creates an attribute payload for a new column in a Dynamics 365 entity.

    :param attribute_type: The type of the attribute, e.g., "String", "DateTime"
    :param attribute_type_name: The name type of the attribute, e.g., "StringType", "DateTimeType"
    :param column_display_name: The display name of the column
    :param column_logical_name: The logical name of the column
    :param additional_properties: Additional properties specific to the attribute type
    :return: A dictionary representing the attribute payload
    """
    
    attribute_payload = {
        "AttributeType": attribute_type,
        "AttributeTypeName": {
            "Value": attribute_type_name
        },
        "Description": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [
                {
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": "",
                    "LanguageCode": 1033
                }
            ]
        },
        "DisplayName": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [
                {
                    "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                    "Label": column_display_name,
                    "LanguageCode": 1033
                }
            ]
        },
        "RequiredLevel": {
            "Value": "None",
            "CanBeChanged": True,
            "ManagedPropertyLogicalName": "canmodifyrequirementlevelsettings"
        },
        "SchemaName": column_logical_name,
        "@odata.type": f"Microsoft.Dynamics.CRM.{attribute_type}AttributeMetadata",
    }

    # Merge additional properties into the attribute payload
    attribute_payload.update(additional_properties)
    
    return attribute_payload
