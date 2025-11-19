# Business Entities Summary (System Entities Filtered Out)

## Overview

- **Total Business Entities**: 820
- **Custom Entities**: 612
- **Standard Business Entities**: 208
- **Activity Entities**: 24
- **Business Relationships**: 2125

## What Was Filtered Out?

System entities removed (144 entities):
- User tracking: `systemuser`, `team`, `businessunit`
- Audit/metadata: `audit`, `duplicaterecord`, `syncerror`
- System jobs: `asyncoperation`, `processsession`, `bulkdeletefailure`
- Backend tracking: `mailboxtrackingfolder`, `principalobjectattributeaccess`
- Solution/customization metadata
- Plugin/SDK entities

## Top 20 Most Connected Business Entities

| Entity | Label | Type | Relationship Count |
|--------|-------|------|--------------------|
| deleteditemreference | Deleted Record Reference | Custom | 435 |
| msdyn_project | Plan | Custom | 104 |
| annotation | Note | Standard | 100 |
| connection | Connection | Standard | 100 |
| account | Account | Standard | 97 |
| contact | Contact | Standard | 90 |
| mspp_website | Website | Custom | 54 |
| knowledgearticle | Knowledge Article | Standard | 52 |
| sla | SLA | Standard | 52 |
| sharepointdocumentlocation | Document Location | Standard | 43 |
| email | Email | Standard | 41 |
| msdyn_projectteam | Project Team Member | Custom | 39 |
| sharepointdocument | Sharepoint Document | Standard | 39 |
| bookableresourcebooking | Bookable Resource Booking | Standard | 37 |
| qrt_financerequests | Finance Requests | Custom | 36 |
| adx_invitation | Invitation | Custom | 35 |
| qrt_procurementrequests | Procurement Reqs | Custom | 34 |
| bookableresourcebookingheader | Bookable Resource Booking Header | Standard | 33 |
| qrt_assetmanagementrequests | AM Requests | Custom | 33 |
| qrt_designrequests | Design Requests | Custom | 33 |

## Standard Business Entities by Category

### Core Business (2 entities)

| Logical Name | Label | Relationships |
|--------------|-------|---------------|
| account | Account | 97 |
| contact | Contact | 90 |

### Activities (8 entities)

| Logical Name | Label | Relationships |
|--------------|-------|---------------|
| appointment | Appointment | 32 |
| email | Email | 41 |
| fax | Fax | 28 |
| letter | Letter | 28 |
| phonecall | Phone Call | 31 |
| socialactivity | Social Activity | 32 |
| task | Task | 32 |
| untrackedemail | UntrackedEmail | 1 |

### Service (2 entities)

| Logical Name | Label | Relationships |
|--------------|-------|---------------|
| kbarticle | Article | 9 |
| knowledgearticle | Knowledge Article | 52 |

### Other (196 entities)

| Logical Name | Label | Relationships |
|--------------|-------|---------------|
| aciviewmapper | ACIViewMapper | 1 |
| actioncard | Action Card | 27 |
| cardtype | Action Card Type | 3 |
| actioncardusersettings | Action Card User Settings | 2 |
| actioncarduserstate | ActionCardUserState | 2 |
| customeraddress | Address | 3 |
| businessunitnewsarticle | Announcement | 1 |
| appmodulemetadata | AppModule Metadata | 0 |
| appmodulemetadataoperationlog | AppModule Metadata Async Operation | 0 |
| appmodulemetadatadependency | AppModule Metadata Dependency | 0 |
| application | Application | 0 |
| applicationfile | Application File | 1 |
| kbarticlecomment | Article Comment | 2 |
| authorizationserver | Authorization Server | 1 |
| azureserviceconnection | Azure Service Connection | 1 |
| bookableresource | Bookable Resource | 20 |
| bookableresourcebooking | Bookable Resource Booking | 37 |
| bookableresourcebookingheader | Bookable Resource Booking Header | 33 |
| bookableresourcebookingexchangesyncidmapping | Bookable Resource Booking to Exchange Id Mapping | 1 |
| bookableresourcecategory | Bookable Resource Category | 13 |

*... and 176 more other entities*

## Custom Entities (Top 50)

| Logical Name | Label | Relationships | Description |
|--------------|-------|---------------|-------------|
| deleteditemreference | Deleted Record Reference | 435 | Deleted Record Reference |
| msdyn_project | Plan | 104 | Delivery entity in an engagement. |
| mspp_website | Website | 54 | Web Portal |
| msdyn_projectteam | Project Team Member | 39 | Entity used to model relationship between resources and project teams. |
| qrt_financerequests | Finance Requests | 36 | Table for managing Finance Requests activities. |
| adx_invitation | Invitation | 35 | Send invitations to existing contacts or email addresses and assign them to web  |
| qrt_procurementrequests | Procurement Reqs | 34 | Table for managing Procurement Requests activities. |
| qrt_assetmanagementrequests | AM Requests | 33 | Table for managing Asset Management Requests activities. |
| qrt_designrequests | Design Requests | 33 | Table for managing Design Requests activities. |
| qrt_estimateresquests | Estimate Requests | 33 | Table for managing Estimate Requests activities. |
| qrt_schedulerequests | Schedule Requests | 33 |  |
| qrt_aossuggestionbox | Dear AOS, | 32 |  |
| qrt_constructionrequests | Construction Reqs | 32 | Table for managing Construction Requests activities. |
| qrt_developmentrequests | Development Reqs | 32 | Table for managing Development Requests activities. |
| qrt_engineeringrequests | Engineering Reqs | 32 | Table for managing Engineering Requests activities. |
| qrt_legalrequests | Legal Requests | 32 | Table for managing Legal Requests activities. |
| msdyn_resourceterritory | Resource Territory | 31 | Allows to specify for which territory a resource could provide services for |
| msdyn_timegroup | Fulfillment Preference | 31 | Specify time groups consisting of multiple time windows to be used for schedulin |
| msdyn_timegroupdetail | Time Group Detail | 31 | Specify individual time windows under a time group. |
| msdyn_bookingalert | Booking Alert | 30 | Alerts that notify schedule board users of booking issues or information. |
| adx_inviteredemption | Invite Redemption | 29 | Holds information about the redemption of an invite. |
| adx_portalcomment | Portal Comment | 29 | An activity which is used to share information between the user and the customer |
| mspp_publishingstatetransitionrule | Publishing State Transition Rule | 29 |  |
| mspp_shortcut | Shortcut | 29 |  |
| qrt_bidissuance | Bid Issuance | 29 | Table for managing Bid Issuance activities. |
| msdyn_bookingalertstatus | Booking Alert Status | 28 | The status of a booking alert. |
| chat | Teams chat | 27 | For internal use only. Entity which stores association data of Dynamics 365 reco |
| msdyn_bookingrule | Booking Rule | 27 | Specify custom rules to be validated by the system before saving a booking recor |
| msdyn_systemuserschedulersetting | System User Scheduler Setting | 27 | Stores user-specific settings for the schedule board. |
| msdyn_resourcerequirement | Resource Requirement | 26 | Entity used to track the high-level information about resource requirements. |
| mspp_redirect | Redirect | 26 |  |
| mspp_webpage | Web Page | 26 | Web Page |
| mspp_adplacement | Ad Placement | 25 |  |
| mspp_pollplacement | Poll Placement | 25 |  |
| msdyn_projecttask | Project Task | 20 | Tasks related to project. |
| environmentvariabledefinition | Environment Variable Definition | 16 | Contains information about the settable variable: its type, default value, and e |
| customapi | Custom API | 14 | Entity that defines a custom API |
| mspp_webformstep | Form Step | 14 | Defines the flow logic of the form's user experience such as steps and condition |
| botcomponent | Copilot component | 13 | Holds key authoring components of a Copilot such a topics, entities, variables,  |
| msdyn_flow_approval | Approval | 12 | An approval. |
| connectionreference | Connection Reference | 11 |  |
| credential | Credential | 11 |  |
| dvtablesearch | DVTableSearch | 11 | DVTableSearches component |
| flowsession | Flow Session | 11 | Entity to store the information that is generated when a Power Automate Desktop  |
| msdyn_aimodel | AI Model | 11 |  |
| msdyn_bookingsetupmetadata | Booking Setup Metadata | 11 |  |
| qrt_equipmentskus | Equipment SKUs | 11 | Table for managing Equipment SKUs data. |
| aipluginoperation | AIPluginOperation | 10 | AIPluginOperations component |
| msdyn_aiconfiguration | AI Configuration | 10 |  |
| msdyn_organizationalunit | Organizational Unit | 10 |  |

*... and 562 more custom entities*
