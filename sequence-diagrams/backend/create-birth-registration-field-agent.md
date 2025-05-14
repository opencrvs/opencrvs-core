# Create birth registration (field agent)

```mermaid
---
title: Create birth registration
---

sequenceDiagram
    autonumber
    participant GraphQL gateway
    participant Workflow
    participant User management
    participant Hearth
    participant Config
    participant Metrics
    participant Notifications
    participant Influx DB
    participant Search
    participant ElasticSearch
    participant Documents
    participant Minio
    participant Country-Config

    GraphQL gateway->>Workflow: POST /create-record
    Workflow--)Hearth: Fetch task from identifier(draft-id)
    Note over Workflow,Hearth: Check existing draft-IDs. If found, return previous declaration info to gateway.

    Workflow--)Search: Search for duplicates

    Workflow--)Documents: POST attachment details to /upload
    Documents->>Minio: Upload attachment documents

    Workflow--)Country-Config: GET trackingId from /tracking-id

    Workflow->>User management: Fetch user/system information
    Workflow->>Hearth: Get practitioner resource

    loop PractitionerRole Locations
      Workflow->>Hearth: Get location by user's practitionerId
    end
    Note over Workflow,Hearth: Update bundle with practitioner details

    Workflow->>Hearth: Save bundle
    Note over Workflow,Hearth: Get hearth response for all entries

    Note over Workflow: Merge changed resources<br /> into record with <br /> hearth's response bundle

    Workflow--)Metrics: POST bundle to /events/{event}/sent-notification
    Metrics->>Influx DB: Write user audit point "IN_PROGRESS"
    Metrics->>Influx DB: Write time logged point & declaration started point

    Note over Workflow,Search: For duplicate declarations, starts here
    Workflow--)Search: Index bundle

    %% upsertEvent
    Search->>ElasticSearch: Search by composition id
    Note over Search,ElasticSearch: Get operation history and createdAt

    %% createIndexBody
      %% createChildIndex
      %% addEventLocation
    Search->>Hearth: Get event location for creating child index

    %% createDeclarationIndex
    Search->>Hearth: Get declarationJurisdictionIds for declaration index
    Search->>ElasticSearch: Get createdBy

    %% createStatusHistory
    Search->>User management: Get user for status history
    Note over Search,Hearth: Compose new history entry

    Search->>ElasticSearch: Index composition
    Workflow->>Hearth: Save bundle to Hearth
    Note over Workflow,Search: For duplicate declarations, ends here

    Workflow--)Search: Index bundle
    Workflow--)Config: Check if notification is enabled
    Workflow--)Notifications: Send notification if enabled

    Notifications->>Country-Config: POST /notification
    Country-Config->>Config: GET Application Config from /publicConfig
    Config->>Country-Config: Get config from /application-config
    Note over Config,Notifications: Get APPLICATION NAME, Notification Delivery Methods

    Note over Country-Config: Send notifications

    Workflow--)GraphQL gateway: Return compositionId, trackingId and duplicate status
```
