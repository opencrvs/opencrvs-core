<p align="center"> <a href="https://www.opencrvs.org"><img src="https://i.imgur.com/W7ULmox.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h1 align="center">Country configuration template repository</h1>
<p align="center">An example country configuration for OpenCRVS.
<br>
<a href="https://github.com/opencrvs/opencrvs-core/issues">Report an issue</a>  ·  <a href="https://community.opencrvs.org">Join our community</a>  ·  <a href="https://documentation.opencrvs.org">Read our documentation</a>  ·  <a href="https://www.opencrvs.org">www.opencrvs.org</a></p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [What is this module for?](#what-is-this-module-for)
- [How do I run the module alongside the OpenCRVS core?](#how-do-i-run-the-module-alongside-the-opencrvs-core)
- [Useful information](#useful-information)
- [What is in the country configuration repository?](#what-is-in-the-country-configuration-repository)
- [Action Confirmation](#action-confirmation)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<br>
<br>

**This repository uses the fictional country "Farajaland" as an example country configuration for [OpenCRVS](https://github.com/opencrvs/opencrvs-core). Create your own country configuration from this template with `npm create @opencrvs/countryconfig`.**

<a href="https://documentation.opencrvs.org/technical/guides/configuration">Read our documentation</a> to learn how to set up your own country configuration using this repo as an example.

# What is this module for?

OpenCRVS requires a country configuration in order to run. This is an example country configuration package for the OpenCRVS core.

OpenCRVS is designed to be highly configurable for your country needs. It achieves this by seeding reference data that it needs from this module and exposing APIs for certain business critical operations.

This module also provides a logical location where you may wish to store the code and run the servers for any custom API integrations, extension modules and innovations to OpenCRVS.

# How do I run the module alongside the OpenCRVS core?

OpenCRVS Core is not run directly from source in this setup. Instead, Core services are deployed as a Helm chart, and Core Docker images are pulled from the configured image tag.

## Prerequisites

### Hardware requirements

Recommended minimum:

- 16 GB RAM
- 8 CPUs
- 100 GB free disk space

### Software requirements

| Tool       | Description                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Kubernetes | Local Kubernetes cluster. Minikube is recommended for Linux. Docker Desktop Kubernetes is recommended for macOS and Windows. |
| Docker     | Required for building the countryconfig image locally.                                                                       |
| kubectl    | Kubernetes command-line tool.                                                                                                |
| Helm       | Used by Tilt to render and deploy OpenCRVS Helm charts.                                                                      |
| Tilt       | Used to manage the local development environment.                                                                            |
| Git        | Used by the Tiltfile to clone OpenCRVS Core charts.                                                                          |

## Development environment setup

### Start local Kubernetes cluster (Minikube)

Minikube is recommended for Linux users.

Start Minikube with enough resources, recommended values are 8 CPU cores and 12G RAM. If Minikube was already running before changing these values, recreate it:

```bash
minikube start \
  --driver=docker \
  --cpus=8 \
  --memory=12g \
  --ports=80:30080
```

Make sure your kubectl context points to Minikube:

```
kubectl config current-context
```

Expected context:

```
minikube
```

> [!NOTE]
> Other local Kubernetes engines may also work, for example:
>
> - Docker Desktop
> - OrbStack
> - kind
> - k3d
> - MicroK8s
>
> If you use a different Kubernetes engine, make sure that:
>
> - Docker image builds are available to the cluster
> - LoadBalancer or NodePort access is configured
> - opencrvs.localhost can resolve to the local ingress endpoint

### Start OpenCRVS

Clone the template using:

```
npm create @opencrvs/countryconfig <your-country-name>
```

Start the local environment:

```
tilt up
```

Open the Tilt UI:

```
http://localhost:10350
```

Wait until the main resources are running.

Then run the data seed task from the Tilt UI:

1. Open http://localhost:10350
2. Find the `2.Data-tasks` section
3. Run the `seed-data` or `clean-&-seed` resource
4. Wait until the job completes

Open OpenCRVS: http://opencrvs.localhost

Thats it! 🎉

### Configuration

The Tiltfile supports the following environment variables.

- `OPENCRVS_CORE_IMAGE_TAG`: Defines the OpenCRVS Core Docker image tag used by the Helm chart.
- `OPENCRVS_CORE_REF`: Defines the OpenCRVS Core Git branch or tag used to fetch Helm charts, use any release/2.1.X branch or tag from https://github.com/opencrvs/opencrvs-core

The Tiltfile performs a sparse checkout of the OpenCRVS Core repository and only downloads the charts directory. You will still be able to make changes and create PRs in Core repository.

# Useful information

## How the Tilt setup works

Tilt performs the following actions:

1. Clones OpenCRVS Core charts into a local .opencrvs-core-charts directory.
2. Builds the countryconfig image locally: `opencrvs/ocrvs-countryconfig:local`
3. Builds the countryconfig assets image: `opencrvs/ocrvs-countryconfig:local-assets`
4. Deploys Components into namespaces:
   - Traefik: `traefik`
   - OpenCRVS dependencies: `opencrvs-deps-dev`
   - OpenCRVS Core: `opencrvs-dev`
5. Overrides the Helm chart countryconfig image values so that Core uses the locally built countryconfig image.
6. Disables automatic Helm install data seeding and exposes data jobs through Tilt instead.

You can inspect resources with:

```
kubectl get pods -n opencrvs-deps-dev
kubectl get pods -n opencrvs-dev
```

## Live update behavior

Tilt builds the countryconfig image locally and watches selected files for changes.

Source code changes under `srv/` are synced into the running container using Tilt live update.

Changes to dependency or image build files trigger a full rebuild instead, for example:

```
package.json
pnpm-lock.yaml
Dockerfile
```

## Development Database Management

Development database tasks are available from the Tilt UI.

Open the Tilt dashboard: http://localhost:10350

Then go to: `2.Data-tasks`

Available tasks:

| Task           | Description                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `data-cleanup` | Clears existing local development data.                                                                      |
| `data-seed`    | Seeds the local environment with development/demo data.                                                      |
| `clean-&-seed` | Runs cleanup first, then seeds the environment again. Use this when you want to reset local data completely. |

### Clean up the local environment

Stop Tilt and remove deployed resources:

```
tilt down
```

Remove minikube cluster:

```
minikube delete
```

# What is in the country configuration repository?

One of the key dependencies and enablers for OpenCRVS is country configuration and a reference data source. This source is bespoke for every implementing nation. So what does it contain?

- The [src](src) folder contains the code for the countryconfig service. Essentially this service could be re-written in another language as long as it provided the same API endpoints and served the same files as listed below.
  - [src/events](src/events) defines the configurable events (birth, death and an example tennis club membership), including their forms, actions and certificates.
  - [src/data-seeding](src/data-seeding) contains the reference data used to seed a new environment: administrative areas, offices, roles and employees.
  - [src/api](src/api) contains the handlers for the endpoints below, e.g. action confirmation, registration numbers, notifications, workqueues and integrations.
  - [src/analytics](src/analytics) contains the analytics database setup. See [ANALYTICS.md](ANALYTICS.md).
- The [tilt](tilt) folder and [Tiltfile](Tiltfile) define the local Kubernetes development environment. Tilt is responsible for deploying OpenCRVS dependencies and Core services using Helm charts, building the local countryconfig image, configuring live updates and exposing operational tasks such as database cleanup and data seeding through the Tilt UI.

## Endpoints

OpenCRVS Core calls the following endpoints. After upgrading, you can check that your country configuration still exposes them by running `npx @opencrvs/toolkit verify-endpoints`. For request and response formats, see the [Country-config APIs](https://documentation.opencrvs.org/technical/apis/country-config-apis) documentation.

**Configuration and reference data**

- `GET /config/application`: general application settings
- `GET /config/events`: event configurations
- `GET /config/workqueues`: workqueue configurations
- `GET /config/roles`: user roles and their scopes
- `GET /config/locations`: administrative areas and offices, used for data seeding
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
- `POST /trigger/user/{event}`: user notifications such as `user-created`, `reset-password` or `2fa`, to be sent to users by SMS, email or another method
- `GET /trigger/system/ready`: called by the events service on startup to register integrations
- `POST /trigger/telemetry`: receives usage reports from the events service

**Other**

- `POST /reindex`: receives events from Core when it reindexes, to populate the analytics database
- `GET /ping`: health check endpoint used for monitoring

**<a href="https://documentation.opencrvs.org/technical/guides/configuration">Read our documentation</a> in order to learn how to make your own country configuration!**

# Action Confirmation

The Action Confirmation is a feature of OpenCRVS that allows for asynchronous confirmation of event actions. See documentation here: [Action Confirmation](./src/api/action-confirmation.md)
