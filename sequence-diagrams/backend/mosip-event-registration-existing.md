## MOSIP Birth Registration - as of OpenCRVS v1.4.0

```mermaid
---
title: MOSIP Event Registration - as of OpenCRVS v1.4.0
---
sequenceDiagram
    autonumber
    participant Client(form NID_VERIFICATION_BUTTON)
    participant Client(OIDPVerificationCallback)
    participant Client(submissionMiddleware)
    participant GraphQL gateway
    participant OpenCRVS auth
    participant Workflow
    participant Hearth
    participant OpenCRVS countryconfig
    participant OpenCRVS MOSIP mediator
    participant E-Signet (OIDP)
    participant MOSIP (OpenCRVS Proxy)
    participant MOSIP Keycloak
    participant MOSIP Kafka

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

    Client(submissionMiddleware)->>GraphQL gateway: markBirthAsRegistered
    GraphQL gateway->>Workflow: POST /create-record
    Note over Workflow: Registration flow as usual / BRN generated in countryconfig
    Workflow->>Webhook: POST to /events/birth/mark-registered
    Webhook->>OpenCRVS MOSIP mediator: POST Full birth composition payload (contains FHIR IDs for Locations) to /webhooks
    OpenCRVS MOSIP mediator->>MOSIP Keycloak: POST get MOSIP auth token to http://keycloak.keycloak/auth/realms/mosip/protocol/openid-connect/token
    MOSIP Keycloak->>OpenCRVS MOSIP mediator: return auth token
    OpenCRVS MOSIP mediator->>MOSIP (OpenCRVS Proxy): GET /generateAid

    MOSIP (OpenCRVS Proxy)->>MOSIP Keycloak: validate auth token
    MOSIP Keycloak->>MOSIP (OpenCRVS Proxy): token validated
    Note over MOSIP (OpenCRVS Proxy): RIDGENERATION - create and log AID
    MOSIP (OpenCRVS Proxy)->>OpenCRVS MOSIP mediator: return application id (AID)
    MOSIP (OpenCRVS Proxy)->>GraphQL gateway: GET /locations generate textual address from FHIR IDs
    GraphQL gateway->>MOSIP (OpenCRVS Proxy): Locations
    MOSIP (OpenCRVS Proxy)->>MOSIP Kafka: Build and send ID JSON
    Note over MOSIP (OpenCRVS Proxy): Will keep polling Kafka until UIN_TOKEN generated

    OpenCRVS MOSIP mediator->>OpenCRVS auth: POST authenticate systen client
    OpenCRVS auth->>OpenCRVS MOSIP mediator: return JWT
    OpenCRVS MOSIP mediator->>OpenCRVS countryconfig: POST AID & BRN to /mosip-openhim-mediator
    OpenCRVS countryconfig->>Hearth: Get Task associated with BRN
    Hearth->>OpenCRVS countryconfig: return Task
    OpenCRVS countryconfig->>Hearth: POST Task with AID
    Hearth->>OpenCRVS countryconfig: success

    MOSIP Kafka->>MOSIP (OpenCRVS Proxy): tokenizeReceivedCredential
    (OpenCRVS Proxy)->>OpenCRVS auth: POST authenticate systen client
    OpenCRVS auth->>MOSIP (OpenCRVS Proxy): return JWT
    (OpenCRVS Proxy)->>OpenCRVS MOSIP mediator: POST uinToken to /birthReceiveNid

    OpenCRVS MOSIP mediator->>OpenCRVS auth:  /verifyToken
    OpenCRVS auth->>OpenCRVS MOSIP mediator: token verified
    OpenCRVS MOSIP mediator->>OpenCRVS countryconfig: POST uinToken & BRN to /mosip-openhim-mediator
    OpenCRVS countryconfig->>Hearth: Get Task associated with BRN
    Hearth->>OpenCRVS countryconfig: return Task
    OpenCRVS countryconfig->>Hearth: POST Task with UIN_TOKEN
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
