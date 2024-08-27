## MOSIP Birth Registration - design for OpenCRVS v1.7.0

```mermaid
---
title: MOSIP Event Registration - design for OpenCRVS v1.7.0
---
sequenceDiagram
    autonumber
    participant Client(form REDIRECT_BUTTON)
    participant Client(form FETCH)
    participant OpenCRVS config
    participant Client(submissionMiddleware)
    participant GraphQL gateway
    participant OpenCRVS auth
    participant Workflow
    participant Hearth
    participant OpenCRVS webhooks
    participant OpenCRVS countryconfig
    participant OpenCRVS-MOSIP mediator
    participant E-Signet (OIDP)
    participant MOSIP (OpenCRVS Proxy)
    participant MOSIP Keycloak
    participant MOSIP Token Seeder
    participant MOSIP Kafka

    Client(form REDIRECT_BUTTON)->>OpenCRVS config: Is OpenCRVS configured to use E-Signet?
    alt OpenCRVS config E-Signet configured
        Client(form REDIRECT_BUTTON)->>E-Signet (OIDP): Click button and redirect to authorize parent/informant uses E-Signet to consent
        E-Signet (OIDP)->>OpenCRVS-MOSIP mediator: Return with JWT token, create a temporary id corresponding to the JWT token
        OpenCRVS-MOSIP mediator->>Client(form REDIRECT_BUTTON): return the temporary id to frontend
        Client(form FETCH)->>OpenCRVS-MOSIP mediator: Fetch the informant's details
        OpenCRVS-MOSIP mediator->>E-Signet (OIDP): oauth/token use code to retrieve token
        E-Signet (OIDP)->>OpenCRVS-MOSIP mediator: return token
        OpenCRVS-MOSIP mediator->>E-Signet (OIDP): oidc/userinfo request parent/informant details
        E-Signet (OIDP)->>OpenCRVS-MOSIP mediator: parent/informant details returned as encrypted JWT. Decode
        OpenCRVS-MOSIP mediator->>GraphQL gateway: Get Location IDs based on textual representation of parent/informant address
        GraphQL gateway->>OpenCRVS-MOSIP mediator: Return FHIR IDs for address if found
        OpenCRVS-MOSIP mediator->>Client(form FETCH): Populate the form with the informant's details 
    else OpenCRVS config E-Signet not configured
        Client(form FETCH)->>OpenCRVS-MOSIP mediator: authenticateNIDWithMOSIPTokenSeeder
        OpenCRVS-MOSIP mediator->>MOSIP Token Seeder: /authtoken/json
        MOSIP Token Seeder->>OpenCRVS-MOSIP mediator: authenticated if authStatus returned with authToken as MOSIP_PSUT_TOKEN_ID
        OpenCRVS-MOSIP mediator->>Client(form FETCH): set motherNidVerification to value of authStatus
    end
    Client(submissionMiddleware)->>GraphQL gateway: markBirthAsRegistered
    Note over Client(submissionMiddleware): Record will stay in WAITING_VALIDATION status and appear in EXTERNAL_VALIDATION_WORKQUEUE work-queue
    GraphQL gateway->>Workflow: POST /create-record
    Note over Workflow: Registration flow as far as call to opencrvs-countryconfig
    Workflow->>OpenCRVS countryconfig: /event-registration - dont create BRN yet
    OpenCRVS countryconfig->>MOSIP Keycloak: POST get MOSIP auth token to http://keycloak.keycloak/auth/realms/mosip/protocol/openid-connect/token
    MOSIP Keycloak->>OpenCRVS countryconfig: return auth token
    OpenCRVS countryconfig->>MOSIP (OpenCRVS Proxy): GET /generateAid
    MOSIP (OpenCRVS Proxy)->>MOSIP Keycloak: validate auth token
    MOSIP Keycloak->>MOSIP (OpenCRVS Proxy): token validated
    Note over MOSIP (OpenCRVS Proxy): RIDGENERATION - create and log AID
    MOSIP (OpenCRVS Proxy)->>OpenCRVS countryconfig: return application id (AID)
    OpenCRVS countryconfig->>Workflow: Return AID
    Note over Workflow: Retain record in WAITING_VALIDATION status as BRN will not be created yet
    OpenCRVS countryconfig->>Hearth: POST Task with AID
    Hearth->>Workflow: success

    MOSIP (OpenCRVS Proxy)->>GraphQL gateway: GET /locations generate textual address from FHIR IDs
    GraphQL gateway->>MOSIP (OpenCRVS Proxy): Locations
    MOSIP (OpenCRVS Proxy)->>MOSIP Kafka: Build and send ID JSON
    Note over MOSIP (OpenCRVS Proxy): Will keep polling Kafka until VID & UIN_TOKEN generated
    (OpenCRVS Proxy)->>OpenCRVS-MOSIP mediator: POST (NID)VID & uinToken to /birthReceiveNid
    OpenCRVS-MOSIP mediator->>OpenCRVS auth: POST authenticate systen client
    OpenCRVS auth->>OpenCRVS-MOSIP mediator: return JWT
    OpenCRVS-MOSIP mediator->>GraphQL gateway: POST (NID)VID & uinToken & BRN to (new) registrationValidated API
    GraphQL gateway->>Workflow: continue current /confirm/registration flow with (NID)VID & UIN_TOKEN as child identifiers.  UIN_TOKEN should never be returned in a GraphQL query to client (PRIVATE)
    Hearth->>OpenCRVS countryconfig: success

```

## OpenCRVS MOSIP mediator - NodeJS - Hosted at OpenCRVS: https://github.com/opencrvs/mosip-mediator

## MOSIP (OpenCRVS Proxy) - Java - Hosted at MOSIP: https://github.com/mosip/mosip-opencrvs

## OpenCRVS countryconfig: https://github.com/opencrvs/opencrvs-mosip

## ENV VARS used in countryconfig:

## MOSIP_MEDIATOR_BIRTH_PROXY_CALLBACK_URL: https://api.collab.mosip.net/opencrvs/v1/birth

## MOSIP_MEDIATOR_GENERATE_AID_URL: https://api.collab.mosip.net/opencrvs/v1/generateAid

## NATIONAL_ID_OIDP_TOKEN_URL: https://esignet.collab.mosip.net/v1/esignet/oauth/v2/token

## NATIONAL_ID_OIDP_USERINFO_URL: https://esignet.collab.mosip.net/v1/esignet/oidc/userinfo
