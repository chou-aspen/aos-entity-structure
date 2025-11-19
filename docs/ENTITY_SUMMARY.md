# Dynamics 365 Entity Structure Summary

## Overview

- **Total Entities**: 964
- **Custom Entities**: 612
- **Standard Entities**: 352
- **Activity Entities**: 25
- **Total Relationships**: 12490

## Top 20 Most Connected Entities

| Entity | Label | Type | Relationship Count |
|--------|-------|------|--------------------|
| systemuser | User | Standard | 3454 |
| userentityinstancedata | User Entity Instance Data | Standard | 665 |
| duplicaterecord | Duplicate Record | Standard | 644 |
| asyncoperation | System Job | Standard | 603 |
| syncerror | Sync Error | Standard | 588 |
| processsession | Process Session | Standard | 570 |
| bulkdeletefailure | Bulk Delete Failure | Standard | 565 |
| principalobjectattributeaccess | Field Sharing | Standard | 535 |
| mailboxtrackingfolder | Mailbox Auto Tracking Folder | Standard | 512 |
| deleteditemreference | Deleted Record Reference | Custom | 483 |
| businessunit | Business Unit | Standard | 466 |
| team | Team | Standard | 460 |
| owner | Owner | Standard | 440 |
| organization | Organization | Standard | 240 |
| fileattachment | FileAttachment | Standard | 173 |
| msdyn_project | Plan | Custom | 144 |
| connection | Connection | Standard | 128 |
| account | Account | Standard | 120 |
| annotation | Note | Standard | 119 |
| transactioncurrency | Currency | Standard | 119 |

## Custom Entities

| Logical Name | Label | Description |
|--------------|-------|-------------|
| msdyn_aibdataset | AI Builder Dataset |  |
| msdyn_aibdatasetfile | AI Builder Dataset File |  |
| msdyn_aibdatasetrecord | AI Builder Dataset Record |  |
| msdyn_aibdatasetscontainer | AI Builder Datasets Container |  |
| msdyn_aibfeedbackloop | AI Builder Feedback Loop |  |
| msdyn_aibfile | AI Builder File |  |
| msdyn_aibfileattacheddata | AI Builder File Attached Data |  |
| msdyn_aiconfiguration | AI Configuration |  |
| msdyn_aidocumenttemplate | AI Document Template | Used to store Document templates |
| msdyn_aievaluationconfiguration | AI Evaluation Configuration |  |
| msdyn_aievaluationmetric | AI Evaluation Metric |  |
| msdyn_aievaluationrun | AI Evaluation Run |  |
| msdyn_aievent | AI Event |  |
| msdyn_aifptrainingdocument | AI Form Processing Document |  |
| aiinsightcard | AI Insight Card |  |
| msdyn_aimodel | AI Model |  |
| msdyn_aimodelcatalog | AI Model Catalog | This table contains records of AI Model Catalogs used for BYOM |
| msdyn_aiodtrainingboundingbox | AI Object Detection Bounding Box |  |
| msdyn_aiodimage | AI Object Detection Image |  |
| msdyn_aiodtrainingimage | AI Object Detection Image Mapping |  |
| msdyn_aiodlabel | AI Object Detection Label |  |
| msdyn_aioptimization | AI Optimization |  |
| msdyn_aioptimizationprivatedata | AI Optimization Private Data |  |
| aipluginconversationstarter | AI Plugin Conversation Starter | Conversation Starters for AI Plugins. |
| aipluginconversationstartermapping | AI Plugin Conversation Starter Mapping | AIPlugins component |
| aiplugingovernance | AI Plugin Governance |  |
| aiplugingovernanceext | AI Plugin Governance Extended |  |
| aiskillconfig | AI Skill Config |  |
| msdyn_aitemplate | AI Template |  |
| msdyn_aitestcase | AI Test Case |  |
| msdyn_aitestcasedocument | AI Test Case Document |  |
| msdyn_aitestcaseinput | AI Test Case Input |  |
| msdyn_aitestrun | AI Test Run |  |
| msdyn_aitestrunbatch | AI Test Run Batch |  |
| aicopilot | AICopilot | AI Copilot |
| aiplugin | AIPlugin | AIPlugins component |
| aipluginauth | AIPluginAuth | Entity to store AIPlugin Auth Information |
| aipluginexternalschema | AIPluginExternalSchema | AIPluginExternalSchemas component |
| aipluginexternalschemaproperty | AIPluginExternalSchemaProperty | AIPluginExternalSchemaProperties component |
| aiplugininstance | AIPluginInstance | AI Plugin Instances Component |
| aipluginoperation | AIPluginOperation | AIPluginOperations component |
| aipluginoperationparameter | AIPluginOperationParameter | Parameter overrides for AI Operation |
| aipluginoperationresponsetemplate | AIPluginOperationResponseTemplate | Content for the AI Plugin Operation Response Template |
| aiplugintitle | AIPluginTitle | AIPlugin Title |
| aipluginusersetting | AIPluginUserSetting |  |
| qrt_assetmanagementrequests | AM Requests | Table for managing Asset Management Requests activities. |
| msdyn_flow_actionapprovalmodel | Action Approval Model | The action approval model data attached to an action approval. |
| activityfileattachment | Activity File Attachment | Attachment entity with data stored in file type attribute |
| mspp_adplacement | Ad Placement |  |
| agentconversationmessage | Agent Conversation Message |  |

*... and 562 more custom entities*
