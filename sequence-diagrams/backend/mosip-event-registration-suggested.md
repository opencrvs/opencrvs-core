## MOSIP Birth Registration - design for OpenCRVS v1.7.0

```mermaid
---
title: MOSIP Event Registration - design for OpenCRVS v1.7.0
---
sequenceDiagram
    autonumber
    participant Client(form NID_VERIFICATION_BUTTON)
    participant OpenCRVS config
    participant Client(OIDPVerificationCallback)
    participant Client(submissionMiddleware)
    participant GraphQL gateway
    participant OpenCRVS auth
    participant OpenCRVS countryconfig
    participant E-Signet (OIDP)
    participant MOSIP (OpenCRVS Proxy)
    participant MOSIP Keycloak
    participant MOSIP Token Seeder
    participant MOSIP Kafka
    participant Workflow
    participant OpenCRVS MOSIP mediator
    participant Hearth

    Client(form NID_VERIFICATION_BUTTON)->>OpenCRVS config: Is OpenCRVS configured to use E-Signet?
    alt OpenCRVS config E-Signet configured
        OpenCRVS config->>Client(form NID_VERIFICATION_BUTTON): Use E-Signet
        Client(form NID_VERIFICATION_BUTTON)->>E-Signet (OIDP): authorize parent/informant uses E-Signet to consent
        E-Signet (OIDP)->>Client(OIDPVerificationCallback): return code
        Client(OIDPVerificationCallback)->>GraphQL gateway: getOIDPUserInfo
        GraphQL gateway->>E-Signet (OIDP): oauth/token use code to retrieve token
        E-Signet (OIDP)->>GraphQL gateway: return token
        GraphQL gateway->>E-Signet (OIDP): oidc/userinfo request parent/informant details
        E-Signet (OIDP)->>GraphQL gateway: parent/informant details returned as encrypted JWT. Decode
        GraphQL gateway->>Hearth: Get Location IDs based on textual representation of parent/informant address
        Hearth->>GraphQL gateway: Return FHIR IDs for address if found
        GraphQL gateway->>Client(OIDPVerificationCallback): return parent/informant details and pre-pop draft, e.g. set motherNidVerification to value of sub
    else OpenCRVS config E-Signet not configured
        OpenCRVS config->>Client(form NID_VERIFICATION_BUTTON): Use MOSIP Token Seeder
        Note over Client(form NID_VERIFICATION_BUTTON): Might need to disable button until more data entered as Token Seeder will require full name, gender & d.o.b to authenticate a parent's NID(VID)
        Client(form NID_VERIFICATION_BUTTON)->>GraphQL gateway: (new) authenticateNIDWithMOSIPTokenSeeder
        GraphQL gateway->>MOSIP Token Seeder: /authtoken/json
        MOSIP Token Seeder->>GraphQL gateway: authenticated if authStatus returned with authToken as MOSIP_PSUT_TOKEN_ID
        GraphQL gateway->>Client(form NID_VERIFICATION_BUTTON): set motherNidVerification to value of authStatus
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
    (OpenCRVS Proxy)->>OpenCRVS MOSIP mediator: POST (NID)VID & uinToken to /birthReceiveNid
    OpenCRVS MOSIP mediator->>OpenCRVS auth: POST authenticate systen client
    OpenCRVS auth->>OpenCRVS MOSIP mediator: return JWT
    OpenCRVS MOSIP mediator->>GraphQL gateway: POST (NID)VID & uinToken & BRN to (new) registrationValidated API
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
