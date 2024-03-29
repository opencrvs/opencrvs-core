# Create birth registration (registrar)

```mermaid
---
title: Create birth registration
---

sequenceDiagram

    autonumber
    participant GraphQL gateway
    participant OpenHIM
    participant Workflow
    participant User management
    participant Hearth
    participant Config
    participant Metrics
    participant Notifications
    participant Influx DB
    participant Search
    participant ElasticSearch
    participant Country configuration
    participant Webhook

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

    Workflow--)Metrics: POST bundle to /events/{event}/sent-notification-for-review
    Metrics->>Influx DB: Write user audit point "DECLARED"

    loop location levels 4, 3, 2
        Metrics->>Hearth: Get parent of Location
        Workflow->>Hearth: Get parent of Location
    end
    Note over Metrics,Hearth: Generate time logged point

    loop location levels 4, 3, 2
        Metrics->>Hearth: Get parent of Location
        Workflow->>Hearth: Get parent of Location
    end
    Note over Metrics,Hearth: Generate declaration started point
    Metrics->>Influx DB: Write audit points

    Workflow->>User management: Fetch user/system information
    Workflow->>Hearth: Get practitioner resource

    loop PractitionerRole Locations
      Workflow->>Hearth: Get location by user's practitionerId
    end
    Note over Workflow,Hearth: Update bundle with practitioner and location details

    Workflow->>Hearth: Save bundle
    Note over Workflow,Hearth: Get hearth response for all entries

    Note over Workflow,Hearth: To external waiting validation state

    Note over Workflow: Merge changed resources<br /> into record with <br /> hearth's response bundle

    Workflow--)Metrics: POST bundle to /events/{event}/waiting-external-validation

    Workflow--)Country-Config: POST record to /event-registration
    Country-Config->>Workflow: POST /confirm/registration
    Workflow->>Search: Get record by id

    Workflow->>User management: Fetch user/system information
    Workflow->>Hearth: Get practitioner resource

    loop PractitionerRole Locations
      Workflow->>Hearth: Get location by user's practitionerId
    end
    Note over Workflow,Hearth: Update bundle with practitioner details

    Workflow->>Hearth: Save bundle
    Note over Workflow,Hearth: Get hearth response for all entries

    Note over Workflow,Hearth: To registered state

    Note over Workflow: Merge changed resources<br /> into record with <br /> hearth's response bundle

    Workflow--)Search: Index bundle
    Workflow--)Metrics: POST bundle to /events/{event}/registered

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
