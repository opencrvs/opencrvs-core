# Request birth registration correction

```mermaid
---
title: Request birth registration correction
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

    GraphQL gateway->>Search: Search for assignment
    Search->>ElasticSearch: Search by Composition id
    Note over GraphQL gateway,ElasticSearch: Check if the user has been assigned to this record
    GraphQL gateway->>OpenHIM: Post FHIR bundle
    OpenHIM->>Workflow: Post FHIR bundle
    Workflow->>User management: Get Practitioner id by token
    Workflow->>Hearth: Get Practitioner
    Workflow->>Hearth: Get Task
    Note over Workflow,Hearth: Get Task's reg status code
    Workflow->>Hearth: Get patient by id
    Note over Workflow,Hearth: Merge patient identifier to FHIR bundle

    Workflow->>Hearth: Get PractitionerRole
    loop PractitionerRole Locations
        Workflow->>Hearth: Get Location
    end
    Note over Workflow,Hearth: Adds primary location to bundle

    Workflow->>Hearth: Get PractitionerRole
    loop PractitionerRole Locations
        Workflow->>Hearth: Get Location
    end
    Note over Workflow,Hearth: Adds office to the bundle

    Workflow->>Hearth: Get Task
    Note over Workflow,Hearth: Check for duplicate status update (throws error if the task is already in the current status!)

    Workflow->>Config: Get form draft status
    Note over Workflow,Config: Adds configuration extension to the Task Bundle distinguish records made when form is in draft

    Workflow->>Hearth: Post FHIR bundle to Hearth
    Workflow->>OpenHIM: Trigger event = request birth request correction

    OpenHIM--)Search: Forward event
    Search->>ElasticSearch: Get composition
    Note over Search,ElasticSearch: Get operation history

    Search->>User management: Get user

    Search->>Hearth: Get office location
    Note over Search,Hearth: Compose new history entry

    Search->>ElasticSearch: Update composition history

    OpenHIM--)Metrics: Forward event
    Metrics->>InfluxDB: Create user audit point "CORRECTED"

    loop location levels 4, 3, 2
        Metrics->>Hearth: Get parent of Location
    end
    Note over Metrics,Hearth: Generate payment point

    loop location levels 4, 3, 2
        Metrics->>Hearth: Get parent of Location
    end
    Note over Metrics,Hearth: Generate correction reason point

    Metrics->>Hearth: Get previous task of Task History
    Note over Metrics,Hearth: Generate event duration point

    loop location levels 4, 3, 2
        Metrics->>Hearth: Get parent of Location
    end
    Note over Metrics,Hearth: Generate time logged point
    Metrics->>Influx DB: Write points
```
