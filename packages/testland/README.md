<p align="center"> <a href="https://www.opencrvs.org"><img src="https://i.imgur.com/W7ULmox.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h1 align="center">Testland country configuration</h1>
<p align="center">The reference country configuration used to develop and test OpenCRVS Core.
<br>
<a href="https://github.com/opencrvs/opencrvs-core/issues">Report an issue</a>  ·  <a href="https://community.opencrvs.org">Join our community</a>  ·  <a href="https://documentation.opencrvs.org">Read our documentation</a>  ·  <a href="https://www.opencrvs.org">www.opencrvs.org</a></p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [What is this module for?](#what-is-this-module-for)
- [How do I run the module alongside the OpenCRVS core?](#how-do-i-run-the-module-alongside-the-opencrvs-core)
- [Deployment](#deployment)
- [What is in this package?](#what-is-in-this-package)
- [Action Confirmation](#action-confirmation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<br>
<br>

**Testland uses the fictional country "Farajaland" as the reference country configuration for [OpenCRVS](https://github.com/opencrvs/opencrvs-core). It is used for Core development, end-to-end tests and feature environments. To create your own country configuration, start from the template instead with `npm create @opencrvs/countryconfig`.**

<a href="https://documentation.opencrvs.org/technical/guides/configuration">Read our documentation</a> to learn how to set up your own country configuration.

# What is this module for?

OpenCRVS requires a country configuration in order to run. Testland is the country configuration that OpenCRVS Core runs against during development and testing.

OpenCRVS is designed to be highly configurable for your country needs. It achieves this by seeding reference data that it needs from this module and exposing APIs for certain business critical operations.

Testland also contains example integrations and tools that are not part of the country configuration template, such as MOSIP, verifiable credentials, a government portal API and QA tools for locations.

# How do I run the module alongside the OpenCRVS core?

Testland is a package in the OpenCRVS Core monorepo and is started together with the Core services.

## Prerequisites

From the root of the opencrvs-core repository, run:

```bash
bash development-environment/check-environment.sh
```

It checks the tools needed to run OpenCRVS Core locally, fixes what it safely can (e.g. enables Corepack) and tells you what is missing. Once pnpm is set up, you can also run it as `pnpm check:environment`.

## Start OpenCRVS

From the root of the opencrvs-core repository:

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the dependencies (databases, Elasticsearch, MinIO etc.) with Docker Compose and all Core services, including Testland on port 3040. It asks for confirmation first, then stops all running Docker containers on your machine.

You can also start them separately:

```bash
pnpm dev --only-dependencies
pnpm dev --only-services
```

To run Core against a different country configuration, use `pnpm dev --no-testland`.

Once the services are running, seed the development data:

```bash
pnpm seed:dev
```

## End-to-end tests

Testland contains the Playwright end-to-end tests for OpenCRVS. See [e2e/README.md](e2e/README.md) for how to run them.

# Deployment

Testland is deployed to Kubernetes using the [OpenCRVS Helm charts](https://github.com/opencrvs/opencrvs-core/tree/develop/charts). Core CI builds this package into the `ghcr.io/opencrvs/ocrvs-testland` image (and its `ocrvs-testland:<tag>-assets` companion image), tagged with the same version as the Core images.

The environments (QA, QA hotfix, e2e, migration staging and migration production), and the workflows that provision the non-prod cluster hosting them and deploy, seed and reset them, live in [opencrvs-testland-infrastructure](https://github.com/opencrvs/opencrvs-testland-infrastructure).

# What is in this package?

- The [src](src) folder contains the code for the countryconfig service.
  - [src/events](src/events) defines the configurable events (birth, death, adoption and an example tennis club membership), including their forms and actions.
  - [src/data-seeding](src/data-seeding) contains the reference data used to seed a new environment: administrative areas, offices, health facilities, roles, employees and other reference data.
  - [src/api](src/api) contains most of the handlers for the endpoints below, e.g. action confirmation, registration numbers, certificates, notifications, workqueues and integrations. The `/config/roles`, `/config/locations` and `/config/users` handlers are in [src/data-seeding](src/data-seeding).
  - [src/analytics](src/analytics) contains the code that loads events and locations into the analytics database. The database itself is set up by [assets/postgres/setup-analytics.sh](assets/postgres/setup-analytics.sh). See [ANALYTICS.md](ANALYTICS.md).
  - [src/verifiable-credentials](src/verifiable-credentials), [src/government-portal-api](src/government-portal-api) and [src/qa-tools](src/qa-tools) contain the Testland-only integrations and tools.
- The [e2e](e2e) folder contains the Playwright end-to-end tests.
- The [postman](postman) folder contains Postman collections demonstrating how to interoperate with OpenCRVS.

## Endpoints

OpenCRVS Core calls the following endpoints. You can run `npx @opencrvs/toolkit verify-endpoints` against a running country configuration. It checks that the public endpoints respond, that the secured ones are either absent or reject unauthenticated requests, that each event's action triggers are secured, and that the translations Core needs are present. The [Country-config APIs](https://documentation.opencrvs.org/technical/apis/country-config-apis) documentation describes the event configuration and action trigger formats.

**Configuration and reference data**

- `GET /config/application`: general application settings
- `GET /config/events`: event configurations
- `GET /config/workqueues`: workqueue configurations
- `GET /config/roles`: user roles and their scopes
- `GET /config/locations`: administrative areas, offices and health facilities, used for data seeding
- `GET /config/users`: default users, used for data seeding (requires authentication)
- `GET /certificates` & `GET /certificates/{id}`: certificate templates (requires authentication)

**Client assets**

- `GET /client-config.js` & `GET /login-config.js`: configuration files the client and login apps need in order to initialise
- `GET /content/{application}`: language content as JSON
- `GET /content/country-logo`: the country logo
- `GET /content/map.geojson`: a map of the country in GeoJSON
- `GET /handlebars.js`: custom Handlebars helpers used in certificates
- `GET /fonts/{filename}`: fonts used in certificates
- `GET /static/{param*}`: static files for the client

**Triggers (require authentication)**

- `POST /trigger/events/{event}/actions/{action}`: called when an action is performed on an event. This is where you can integrate with external systems, or generate registration numbers on `REGISTER`. See [Action Confirmation](#action-confirmation).
- `POST /trigger/user/*`: one route per user notification, such as `/trigger/user/user-created`, `/trigger/user/reset-password` or `/trigger/user/2fa`, to be sent to users by SMS, email or another method
- `GET /trigger/system/ready`: called by the events service on startup to register integrations
- `POST /trigger/telemetry`: receives usage reports from the events service

**Other**

- `POST /reindex`: receives events from Core when it reindexes, to populate the analytics database
- `GET /ping`: health check endpoint used for monitoring
- `POST /email`: sends an email, used internally e.g. for monitoring alerts and deployment notifications. It is blocked from outside the cluster in deployed environments.

**Testland only**

These endpoints are examples and are not required by OpenCRVS Core.

- `GET /causes-of-death`: searches cause of death codes
- `GET /dashboards/registrations-proxy` & `GET /dashboards/primary-office`: scope the Metabase registrations dashboard to the user's primary office
- `POST /trigger/events/birth/actions/{action}` & `POST /trigger/events/death/actions/{action}`: send informant notifications and verify identities with MOSIP
- `POST /trigger/events/birth/actions/REGISTER` & `POST /trigger/events/death/actions/REGISTER`: generate the registration number and forward the registration to MOSIP where applicable
- `POST /trigger/events/birth/actions/APPROVE_CORRECTION`: sends informant notifications and forwards corrected birth registrations to MOSIP
- `POST /trigger/events/adoption/actions/REGISTER`: seals the original birth record of the adopted child, then generates the registration number and sends the informant notification. The registration is rejected if sealing fails.
- `/verifiable-credentials/*` and `/_demo-issuer/*`: verifiable credential issuance examples
- `/api/upload` & `/api/events/*`: government portal API example
- `GET /locations` & `GET /administrative-areas`: QA tool pages for the location write APIs, with `GET /{locations|administrative-areas}/search`, `POST`, `PUT /{id}` and `DELETE /{id}/versions/{versionId}` routes that proxy search and writes to the gateway
- `/graphql`: proxies requests to the Core gateway
- `GET /{param*}`: serves the [public](public) folder, a page for printing all registrations

**<a href="https://documentation.opencrvs.org/technical/guides/configuration">Read our documentation</a> in order to learn how to make your own country configuration!**

# Action Confirmation

The Action Confirmation is a feature of OpenCRVS that allows for asynchronous confirmation of event actions. See documentation here: [Action Confirmation](./src/api/action-confirmation.md)
