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
- [Userful information](#userful-information)
- [What is in the Countryconfig configuration module repository?](#what-is-in-the-countryconfig-configuration-module-repository)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<br>
<br>

**This repository uses the fictional country "Farajaland" as an example country configuration for [OpenCRVS](https://github.com/opencrvs/opencrvs-core). You should fork this repository to create your own country configuration.**

<a href="https://documentation.opencrvs.org/setup/3.-installation/3.2-set-up-your-own-country-configuration">Read our documentation</a> to learn how to set up your own country configuration using this repo as an example.

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

Clone this repository:

```
git clone https://github.com/opencrvs/opencrvs-countryconfig.git
cd opencrvs-countryconfig
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
- `OPENCRVS_CORE_REF`: Defines the OpenCRVS Core Git branch or tag used to fetch Helm charts, use any release/2.0.X branch or tag from https://github.com/opencrvs/opencrvs-core

The Tiltfile performs a sparse checkout of the OpenCRVS Core repository and only downloads the charts directory. You still be able to modify changes and create PRs in Core repository.

# Userful information

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
yarn.lock
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

# What is in the Countryconfig configuration module repository?

One of the key dependencies and enablers for OpenCRVS is country configuration and a reference data source. This source is bespoke for every implementing nation. If you would like to create your own country implementation, we recommend that you duplicate this repository and use it as a template. So what does it contain?

- The DEPRECATED [infrastructure](infrastructure) folder containing all Ansible server configuration files, deployment scripts and docker-compose files allowing you to configure OpenCRVS to run on any infrastructure stack without requiring a fork in opencrvs-core.

- The [src](src) folder contains the code required to run the countryconfig microservice apis, configure your registration form and seed your country implementation with reference data. Essentially this repository could be re-written from NodeJS into Java or another language as long as the service provided the same API endpoints and served the same files as listed below. For more information please [read this section of the documentation.](https://documentation.opencrvs.org/setup/3.-installation/3.2-set-up-your-own-country-configuration)

- The [tilt](tilt) folder and [Tiltfile](Tiltfile) define the local Kubernetes development environment. Tilt is responsible for deploying OpenCRVS dependencies and Core services using Helm charts, building the local countryconfig image, configuring live updates and exposing operational tasks such as database cleanup and data seeding through the Tilt UI.

- Postman collections demonstrate how to interoperate with OpenCRVS. You can build any custom integration into OpenCRVS in this repository if you need to.

- Business critical API and hosted file endpoints (Data seeding)

**Data seeding**

When the OpenCRVS Core servers start up with un-seeded databases they call the following endpoints in order to populate the databases accordingly:

1. `GET /application-config`

   - Configures general application settings

2. `GET /users`

   - Configures at a minimum, a default National System Admin user for the application. More users can be created for demonstration purposes or in a batch. The passwords entered are required to be changed by the user on first login.

3. `GET /roles`

   - Seeds the internal role titles used by your civil registration orgnisation mapping to the available OpenCRVS user types.

4. `GET /locations`

   - Seeds the administrative structure of your country following the Humdata standard

5. `GET /statistics`

   - Applies historical population and crude birth rates disaggregated by gender to your administrative structure. This data ensures that your registration completeness rates are accuratley calculated.

6. `GET /certificates`

   - Configures the available event certificate SVG files. These files can be updated in future via the National System Administrator user interface.

**Business critical APIs**

1. `GET /forms`

   - Configures versioned registration forms for OpenCRVS vital events as JSON.

2. `GET /content/{application}`

   - Returns all language content as JSON

3. `POST /notification`

   - Receives notification payloads from OpenCRVS Core in order to transmit messages to staff and customers based on SMS, Email or other customisable method.

4. `GET /crude-death-rate` (Deprecation warning!)

   - OpenCRVS "metrics" microservice receives a global crude death rate constant from this endpoint in order to calculate death registration completeness rates. Unlike for crude birth rate, most countries do not have a statistic by administrative area disaggregated by gender for death rate. This API endpoint can be considered as tehcnical debt and will likely be replaced by a config setting in the `GET /application-config` response.

5. `POST /event-registration`

   - This synchronous API exists as it is the final step before legal registration of an event. Some countries desire to create multiple identifiers for citizens at the point of registration using external systems. Some countries wish to integrate with another legacy system just before registration. A synchronous 3rd party system can be integrated at this point. Some countries wish to customise the registration number format. The registration number can be created at this point. Some countries use sequential numbering for registration numbers. While it is possible to create that functionality here, we strongly discourage that approach and advise our unique alphanumeric ID format using the Tracking ID. The reason is, under times of high traffic, it is likely that sequential number generation can slow the performance of the service. In a such a case a queue could be implemented here.

6. `GET /validators.js` & `GET /conditionals.js`

   - Registration form JSON "Validators" and "Conditionals" refer to in-built OpenCRVS Core JavaScript form validation and conditional methods. Custom methods can be exposed to OpenCRVS Core via these endpoints.

7. `GET /login-config.js` & `GET /client-config.js`

   - JS configuration settings files that the clients require in order to initialise, set up languages, track any errors and find essential services. 2 files for development and production environments must be available in each case.

8. `GET /content/country-logo`

   - The country logo is loaded into HTML emails so must be hosted

9. `GET /content/map.geojson`

   - A map of the country in GeoJSON must be hosted as it is loaded into OpenCRVS Core Metabase Dashboards as a UI component

10. `GET /ping`

- A service health check endpoint used for 3rd party application stack monitoring

**<a href="https://documentation.opencrvs.org">Read our documentation</a> in order to learn how to make your own country configuration!**

# Action Confirmation

The Action Confirmation is a feature of OpenCRVS that allows for asynchronous confirmation of event actions. See documentation here: [Action Confirmation](./src/api/action-confirmation.md)
