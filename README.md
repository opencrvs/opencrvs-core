<p align="center"> <a href="https://imgur.com/mGNCIvh"><img src="https://i.imgur.com/mGNCIvh.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">OpenCRVS</h3>
<p align="center"> A digital public good for civil registration
<br>
<a href="https://github.com/opencrvs/opencrvs-core/issues">Report an issue</a>  ·  <a href="https://www.opencrvs.org/case-studies">Case studies</a>  ·  <a href="https://www.opencrvs.org/implementation">Implementations</a>  ·  <a href="https://www.opencrvs.org/about-us">About us</a></p>

[![Build Status](https://travis-ci.org/opencrvs/opencrvs-core.svg?branch=master)](https://travis-ci.org/opencrvs/opencrvs-core) [![codecov](https://codecov.io/gh/opencrvs/opencrvs-core/branch/master/graph/badge.svg)](https://codecov.io/gh/opencrvs/opencrvs-core)[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [OpenCRVS](#opencrvs)
- [Important! Please read](#important-please-read)
- [Install dependencies](#install-dependencies)
- [Install OpenCRVS](#install-opencrvs)
- [Log into OpenCRVS](#log-into-opencrvs)
  - [**Field Agent**](#field-agent)
  - [**Registration Agent**](#registration-agent)
  - [Registrar](#registrar)
  - [Local System Admin](#local-system-admin)
  - [National System Admin](#national-system-admin)
- [Starting and stopping OpenCRVS](#starting-and-stopping-opencrvs)
  - [Starting](#starting)
  - [Stopping](#stopping)
- [Other servers](#other-servers)
  - [React Storybook](#react-storybook)
  - [**OpenHIM**](#openhim)
- [Configuring OpenCRVS](#configuring-opencrvs)
- [What are the key OpenSource dependencies of OpenCRVS?](#what-are-the-key-opensource-dependencies-of-opencrvs)
  - [Hearth MongoDB Database layer](#hearth-mongodb-database-layer)
  - [ElasticSearch](#elasticsearch)
  - [InfluxData](#influxdata)
  - [OpenHIM enterprise service bus, interoperability Layer](#openhim-enterprise-service-bus-interoperability-layer)
- [What is inside the OpenCRVS packages?](#what-is-inside-the-opencrvs-packages)
  - [OpenCRVS microservice business layer packages](#opencrvs-microservice-business-layer-packages)
  - [OpenCRVS client application packages](#opencrvs-client-application-packages)
  - [OpenCRVS component library package](#opencrvs-component-library-package)
  - [OpenCRVS performance testing packages](#opencrvs-performance-testing-packages)
  - [What automated testing support is there?](#what-automated-testing-support-is-there)
- [Become part of the OpenCRVS Community](#become-part-of-the-opencrvs-community)
- [Contributing](#contributing)
  - [How to tag an OpenCRVS release?](#how-to-tag-an-opencrvs-release)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## OpenCRVS

[OpenCRVS](https://www.opencrvs.org/) (Civil registration & Vital Statistics) is a digital public good to help achieve universal civil registration and evidence-based decision making in all country contexts.

> **We are on a mission to ensure that every individual on the planet is recognised, protected and provided for from birth.**

## Important! Please read

The following instructions will guide you on how to set up a **local, demo development environment of OpenCRVS** using our fictional country configuration: "Farajaland".

In order to run OpenCRVS, we expect that you have a working knowledge of Linux / Unix operating systems and can run terminal commands.

OpenCRVS consists of multiple servers which run in Docker containers and requires Node JS. You should be familiar with the concepts of Docker and Node JS web application software development.

Install the dependencies and follow the first time setup instructions. This will checkout, download, install, configure and start all the servers for you in order to get up and running quickly with OpenCRVS.

Read review our [documentation](http://documentation.opencrvs.org/opencrvs-core/) before going further.

## Install dependencies

Dependencies are required. Ensure you have satisfied all the following requirements before continuing:

- **Operation system**: Linux or Unix operating system is required: e.g. Ubuntu or Mac OSX: If you do not have Ubuntu or MacOSX, investigate installing a [virtual](https://www.virtualbox.org/) [Ubuntu](https://ubuntu.com/download/desktop) environment on your computer.
- **Disk space and RAM:** A minimum of 10GB of hard drive space available and at least 8GB of RAM. If you are using virtualisation, ensure this is dedicated to the environment.
- **Docker**: On Ubuntu, install [Docker](https://docs.docker.com/engine/install/ubuntu/) & [Docker Compose](https://docs.docker.com/compose/install/). On Mac, install [Docker for Mac](https://docs.docker.com/desktop/mac/install/). On Mac, in Docker for Mac preferences, assign 4 CPUs, at least 8GB Memory or more, Swap 4GB and 4 CPUs if your system allows. Elastic search needs a lot of memory to run. On Ubuntu we set enough RAM automatically.
- **Nodejs:** Install [Node](https://nodejs.org/en/download/) v.14.15.0, v14.15.4, 14.17.0 or v14.18.1 (this release has been tested on those versions). You can manage the Node version of your choice using [Node Version Manager](https://nodejs.org/en/download/package-manager/#nvm).
- **Yarn:** Install the [Yarn Package Manager](https://classic.yarnpkg.com/en/docs/install) for Node
- **Chrome:** Install [Google Chrome](https://www.google.com/chrome). The OpenCRVS client application is a progressive web application.
- **tmux:** Install [tmux](https://github.com/tmux/tmux/wiki). Multiple terminal windows are required to run OpenCRVS Core alongside the default country configuration. On Ubuntu run: `sudo apt-get install tmux` to install. On Mac, you can install tmux using Homebrew or MacPorts.

## Install OpenCRVS

The following instructions will guide you on how to set up a **local, demo development environment of OpenCRVS** using our fictional country configuration: "Farajaland". To deploy OpenCRVS onto a publicly accessible server, follow [these instructions](https://github.com/opencrvs/opencrvs-core/tree/develop/infrastructure/server-setup).

1. Check you have installed all the dependencies. See above.
2. Run `git clone https://github.com/opencrvs/opencrvs-core.git`
3. Run `cd opencrvs-core`
4. Run `git checkout master`
5. Run `bash setup.sh` (takes 10-15 minutes)

   This installer script will:

   - Tests your dependencies
   - Checks that required ports are available. **NOTE: MacOS Monterey runs AirPlay on port 5000. Mac Monterey users need to disable AirPlay in System Preferences in order to run OpenCRVS.**
   - Download and install all Docker images
   - Check out the example OpenCRVS country configuration
   - Runs all OpenCRVS Core microservices
   - Run the OpenCRVS fictional country configuration, "Farajaland" and populate local databases with Farajaland reference data
   - If there are any missing dependencies the script will exit and display instructions. Once the dependency is satisfied, you can try again.

6. On completion you will see the OpenCRVS logo
7. Open the url **[`http://localhost:3020/`](http://localhost:3020/)**
8. You have successfully installed OpenCRVS! 🎉
9. Proceed to login using the details below
10. To stop OpenCRVS running in the installer, type **Ctrl+c**, then **exit** in each tmux terminal window

## Log into OpenCRVS

Open the url **[`http://localhost:3020/`](http://localhost:3020/)**

Use one of the following authentication details for your user of choice. To learn about these user roles and to perform civil registration tasks, read our [documentation](http://documentation.opencrvs.org/)

### **Field Agent**

Username: **kalusha.bwalya** / Password: **test** / SMS code: **000000**

### **Registration Agent**

Username: **felix.katongo** / Password: **test** / SMS code: **000000**

### Registrar

Username: **kennedy.mweene** / Password: **test** / SMS code: **000000**

### Local System Admin

Username: **emmanuel.mayuka** / Password: **test** / SMS code: **000000**

### National System Admin

Username: **jonathan.campbell** / Password: **test** / SMS code: **000000**

## Starting and stopping OpenCRVS

After you have installed OpenCRVS. The setup script will have installed the [opencrvs-farajaland country configuration](https://github.com/opencrvs/opencrvs-farajaland) in a directory alongside opencrvs-core. The country configuration is a separate server that must be started and stopped alongside opencrvs-core.

To start and stop opencrvs-core and the country configuration server, use the following commands.

### Starting

1. Run `cd opencrvs-core`
2. Run `pwd` to output the path. (You have to pass the absolute path to opencrvs-core as a parameter when starting the country configuration )
3. Copy the path
4. Run `yarn dev` to start opencrvs-core

   If you did not previously run our setup command, Docker will have to download Mongo DB, ElasticSearch, OpenHIM and Hearth docker images. These are large files. Then docker will build them and you will see Mongo errors output for a long time until Mongo is running.

   If you did run our setup command, OpenCRVS will start much faster.

   Wait for the OpenCRVS client app to build completely (output will stop and you will see the message: @opencrvs/client: Compiled with warnings. Along with TypeScript/Node dependency warnings... ), then OpenCRVS Core will be available.

5. Open a new terminal window
6. Run `cd ../opencrvs-farajaland`
7. Run `yarn dev <!-- paste in the absolute path to your opencrvs-core directory here -->` to start the country configuration server

### Stopping

1. Press Ctrl+c in the opencrvs-core terminal
2. Press Ctrl+c in the opencrvs-farajaland terminal

## Other servers

When OpenCRVS is running, you can browse to other interesting servers such as:

### React Storybook

Our UI component styleguide, available here: **[http://localhost:6060/](http://localhost:6060/)**

This is a work in progress

### **OpenHIM**

OpenHIM is designed to ease interoperability between OpenCRVS and external systems such as Health & National ID. It provides external access to the system via secure APIs. OpenHIM channels and governs internal transactions, routing, orchestrating and translating requests into [FHIR](https://www.hl7.org/fhir/) between services and the database layer.

1. Visit [`http://localhost:8888/#!/login`](http://localhost:8888/#!/login)
2. Login. username: **root@openhim.org** / Password: **password**

   When logging into OpenCRVS core locally, OpenHIM will display an error " ..if you are using a self-signed certificate, you may first need to instruct your browser to accept it.

   You can do so by accessing the following link." Click the link, and you will see the Chrome: Your connection is not private" error.

   This is nothing to worry about as when deploying OpenCRVS core to a server, our Traefik service provisions a LetsEncrypt SSL cert across the entire stack. Click "Advanced" & "Proceed to localhost (unsafe)". You will see output like this `{"master":655.1310464,"now":1642447245037}`.

   You can now go back to this OpenHIM link and login again freely: **[http://localhost:8888/#!/login](http://localhost:8888/#!/login)**

## Configuring OpenCRVS

A companion example country configuration for Farajaland is checked out for you automatically using our setup script above. This country configuration server runs alongside opencrvs-core and serves languages, form configuration, logo files, adminisrative structure (jurisdictions and offices) etc. To see the code, learn more and fork for your requirements, visit the repo. [opencrvs-farajaland](https://github.com/opencrvs/opencrvs-farajaland).

## What are the key OpenSource dependencies of OpenCRVS?

The following dependencies are automatically provisioned alongside the OpenCRVS Core in [docker](https://www.docker.com/) containers.

<br>
<p align="left">
<img src="https://static.wixstatic.com/media/93440e_d04078ae922a4126b8e9dd3f96066505~mv2.png/v1/fill/w_136,h_39,al_c,q_80,usm_0.66_1.00_0.01/FHIR_Foundation.webp" width="136" height="39">
</p>

#### Hearth MongoDB Database layer

In order to support configuration for limitless country scale, OpenCRVS was designed for [NoSQL](https://en.wikipedia.org/wiki/NoSQL), built on [MongoDB](https://www.mongodb.com/), and aligned to a globally recognised healthcare standard.

Massively scalable and extensible, [Hearth](https://github.com/jembi/hearth) is an OpenSource NoSQL database server built by the OpenCRVS founding member [Jembi Health Systems](https://www.jembi.org/), using interoperable [Health Level 7](www.hl7.org) [FHIR](https://www.hl7.org/fhir/) v4 ([ANSI](https://www.ansi.org/) Accredited, Fast Healthcare Interoperability Resources) as standard.

We innovatively extended [FHIR](https://www.hl7.org/fhir/) to support the civil registration context. Our civil registration FHIR standard can be contributed to in this [repository](https://github.com/opencrvs/opencrvs-core-fhir-templates) at Jembi.

<br>
<p align="left">
<img src="https://static.wixstatic.com/media/93440e_21c72b72ff3a405596448e33f80a719c~mv2_d_3422_1781_s_2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/Elasticsearch-Logo-Color-V.webp" width="136" height="70">
</p>

#### ElasticSearch

De-duplication management to ensure data integrity is essential to any respectable civil registration system. A fast search engine lowers operational costs and improves the user experience for frontline staff.

OpenCRVS uses [ElasticSearch](https://www.elastic.co/), an industry standard, NoSQL document orientated, real-time de-duplication & search engine. Lightning fast, intelligent civil registration record returns are possible, even with imprecise, “fuzzy” search parameters.

<br>
<p align="left">
<img src="https://static.wixstatic.com/media/93440e_7ae07f5f77c6407080656fff4e0cdcd3~mv2.jpg/v1/fill/w_134,h_26,al_c,q_80,usm_0.66_1.00_0.01/influxdata-2.webp" width="134" height="26">
</p>

#### InfluxData

Hyper efficient and optimised, [Influx](https://www.influxdata.com) is a time series database for big data insights. Millisecond level query times facilitate civil registration statistical queries over months of data, disaggregated by gender, location and configurable operational and statistical parameters.

<br>
<p align="left">
<img src="https://static.wixstatic.com/media/93440e_bdd011d5e3744e7b84684e6789c1f5c7~mv2.png/v1/fill/w_136,h_40,al_c,q_80,usm_0.66_1.00_0.01/openhim-logo-green.webp" width="136" height="40">
</p>

#### OpenHIM enterprise service bus, interoperability Layer

The [OpenHIM (Health Information Mediator)](https://github.com/jembi/openhim-core-js) is a NodeJS enterprise service bus designed to ease interoperability between OpenCRVS and external systems such as Health & National ID. It provides external access to the system via secure APIs. OpenHIM channels and governs internal transactions, routing, orchestrating and translating requests into [FHIR](https://www.hl7.org/fhir/) between services and the database layer.

## What is inside the OpenCRVS packages?

The core of OpenCRVS is a monorepo organised using [Lerna](https://github.com/lerna/lerna). Each package reorts unit test coverage in [Jest](https://jestjs.io/). Following the [microservice](https://en.wikipedia.org/wiki/Microservices), 1 service per container model, every package is independently scalable in a single [docker](https://www.docker.com/) container.

<br>

<br>
<p align="left">
<img src="https://static.wixstatic.com/media/93440e_168a1efc9a3d4a47bc9282c5b684df6e~mv2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/typescript.webp" width="70" height="70" hspace="16">
  <img src="https://static.wixstatic.com/media/93440e_0e7fdde3dc404a8cbafdf70c18cedbc6~mv2.png/v1/fill/w_100,h_70,al_c,q_80,usm_0.66_1.00_0.01/hapi-logo.webp" width="100" height="70" hspace="16">
  <img src="https://static.wixstatic.com/media/93440e_65930e880f9e4efc822db3d5f3ddeb8a~mv2.png/v1/fill/w_90,h_51,al_c,q_80,usm_0.66_1.00_0.01/node.webp" width="90" height="51" hspace="16">
</p>

<br>

### OpenCRVS microservice business layer packages

The OpenCRVS’ back end microservice architecture enables continuous evolution of its business requirements.

The microservices are written in [TypeScript](https://github.com/microsoft/TypeScript) (a strictly typed superset of JavaScript that compiles to JavaScript) and NodeJS using the fully documented [HapiJS](https://github.com/hapijs/hapi) framework.

Each microservice in OpenCRVS has no knowledge of other services or business requirements in the application, and each exposes it’s capabilities via [JWT](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/) secured APIs.

Microservices:

1. [auth](https://github.com/opencrvs/opencrvs-core/tree/master/packages/auth) - the authentication microservice for OpenCRVS, [JWT](https://jwt.io/) token generation and management in [Redis](https://www.redislabs.com/).

⋅⋅⋅Our client applications are protected by SMS [2-Factor Authentication](https://en.wikipedia.org/wiki/Multi-factor_authentication). Our apps and microservices utilise [OAuth best practices](https://tools.ietf.org/id/draft-ietf-oauth-jwt-bcp-02.html) for JWT tokens.

<p align="left">
<img src="https://static.wixstatic.com/media/93440e_297d9c18fc9e48e78b39e885bbfdaa13~mv2_d_1200_1204_s_2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/OAuth_svg.webp" width="70" height="70">
</p>

2. [commons](https://github.com/opencrvs/opencrvs-core/tree/master/packages/commons) - a shared library package that all microservoce pa

3. [gateway](https://github.com/opencrvs/opencrvs-core/tree/master/packages/gateway) - the [GraphQL](https://graphql.org/) and [Apollo](https://www.apollographql.com/) API gateway for the OpenCRVS client.

<br>
<p align="left">
<img src="https://static.wixstatic.com/media/93440e_d1ec46ba4c2d4c1dbb6afe6b9b7143de~mv2.png/v1/fill/w_133,h_40,al_c,q_80,usm_0.66_1.00_0.01/graphql.webp" width="133" height="40">
</p>

Using [GraphQL](https://graphql.org/) allows OpenCRVS to perform much faster and more responsively in remote areas by drastically reducing the number of HTTP requests that are required to render a view in the presentation layer.⋅⋅

The OpenCRVS GraphQL Gateway is a JWT protected [Apollo](https://www.apollographql.com/) server that requests and resolves [FHIR](https://www.hl7.org/fhir/) resources from [Hearth](https://github.com/jembi/hearth) via [OpenHIM](https://github.com/jembi/openhim-core-js) into GraphQL, for easy consumption in the client applications.

- [metrics](https://github.com/opencrvs/opencrvs-core/tree/master/packages/metrics) - the civil registration metrics and analytics microservice using the [Influx](https://www.influxdata.com) time series database.

- [notification](https://github.com/opencrvs/opencrvs-core/tree/master/packages/notification) - the microservice that manages SMS communications from OpenCRVS, including content management and SMS supplier details.

- [search](https://github.com/opencrvs/opencrvs-core/tree/master/packages/search) - the search microservice for OpenCRVS using [ElasticSearch](https://www.elastic.co/)

- [user-mgnt](https://github.com/opencrvs/opencrvs-core/tree/master/packages/user-mgnt) - the user management microservice for the OpenCRVS client. User permissions and roles can be centrally managed, supporting IT organisations that conform to [ISO27001](https://www.iso.org/isoiec-27001-information-security.html) certification.

- [workflow](https://github.com/opencrvs/opencrvs-core/tree/master/packages/workflow) - the OpenCRVS business process orchestration microservice, mediating civil registration vital event status and audit updates.

<br>

### OpenCRVS client application packages

<p align="left">
<img src="https://static.wixstatic.com/media/93440e_50ed7c9e719e44daa7ca7d3e183f4071~mv2.png/v1/fill/w_121,h_55,al_c,q_80,usm_0.66_1.00_0.01/react.webp" width="122" height="55">
</p>

- [login](https://github.com/opencrvs/opencrvs-core/tree/master/packages/login) - the login UI client built in [React](https://reactjs.org/).

- [client](https://github.com/opencrvs/opencrvs-core/tree/master/packages/client) - the OpenCRVS UI client for civil registration built in [React](https://reactjs.org/).

Client [npm](https://www.npmjs.com/) dependencies and enablers include:

- Easy build configuration with [create-react-app](https://github.com/facebook/create-react-app), [craco](https://github.com/gsoft-inc/craco), [typrescript-eslint](https://github.com/typescript-eslint/typescript-eslint)

- Multi-lingual content management support using [react-intl](https://github.com/formatjs/react-intl)

- ES6 JS component styling using [styled-components](https://styled-components.com/)

- Fully configurable, high performance form management using [formik](https://github.com/jaredpalmer/formik)

- Pure JavaScript, client side, offline PDF certificate generation using [pdfmake](http://pdfmake.org/)

- Read-only application state management using [redux](https://github.com/reduxjs/redux)

- Unit tests coverage with [Jest](https://jestjs.io/) & [Enzyme](https://airbnb.io/enzyme/) UI component tests.

<br>
<p align="left">
<img src="https://static.wixstatic.com/media/93440e_8452ed95c717459e86c95ed0e17378ad~mv2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/PWA-Progressive-Web-App-Logo.webp" width="136" height="70">
</p>

Using an Android [progressive web application](https://developers.google.com/web/progressive-web-apps) for our client app means that we can take advantage of offline functionality and native mobile features using [Workbox](https://developers.google.com/web/tools/workbox), without the [TCO](https://en.wikipedia.org/wiki/Total_cost_of_ownership) overhead of maintaining multiple web and mobile codebases and respective App/Play Store releases.

In remote areas, registrars can save a configurable number of registrations offline on their mobile phone using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

<br>

### OpenCRVS component library package

[components](https://github.com/opencrvs/opencrvs-core/tree/master/packages/components) - a UI component library package for the clients using [React Styleguidist](https://github.com/styleguidist/react-styleguidist).

<br>

### OpenCRVS performance testing packages

- [integration](https://github.com/opencrvs/opencrvs-core/tree/master/packages/integration) - performance tests for OpenCRVS using the [K6](https://k6.io/) framework.

<br>

### What automated testing support is there?

Besides the thorough Jest unit testing coverage on opencrvs-core, we supply e2e UI test scripts using [Cypress](https://www.cypress.io/).

Because the OpenCRVS UI is completely configurable to your country, the end-to-end testing scripts are located in the [example country configuration server for Farajaland.](https://github.com/opencrvs/opencrvs-farajaland/tree/master/cypress)

<br>

## Become part of the OpenCRVS Community

We want to see OpenCRVS implemented across the world. We can’t do this alone. Through the OpenCRVS Community, we are uniting experts in civil registration and other interested parties.

[Visit our website](https://www.opencrvs.org)

[Join our Gitter community](https://gitter.im/opencrvs/community#)

<br>

## Contributing

You may view/add issues here: https://github.com/opencrvs/opencrvs-core/issues

To contribute code, please review the CONTRIBUTING.md file https://github.com/opencrvs/opencrvs-core/blob/master/CONTRIBUTING.md, fork the repository and submit a pull request. The authors will review the code and merge it in if all is well.

By contributing to the OpenCRVS code, you are conforming to the terms of the license below.

<br>

### How to tag an OpenCRVS release?

So you have contributed to core and want to make a new release as an OpenCRVS core repo admin?

1. Update all packages with the new version number according to [semver](https://semver.org/). All packages will have the same version for simplicity as they are all designed to be used together. Update all dependencies to point to the newly created versions. E.g. `client` depend on `components`, so update the dependency: Do a find and replace for `1.0.0-alpha.2` and replace with `1.0.0-alpha.3`

2. Run `yarn` to ensure there are no version errors.

3. Run `yarn test` and ensure all passed.

4. Run `git tag v<version_number>` e.g. `git tag v1.0.0-alpha.3.1`

5. Run `git push origin v<version_number>`

6. Create a [new release on Github](https://github.com/opencrvs/opencrvs-core/releases) using the tag you just pushed and including any release notes.

7. Dockerhub should automatically build the images when a new release tag is created in Git. Howver Dockerhub can sometimes timeout and you may need to compose and push the release tagged images locally. To do that, run `yarn compose:push:release`

<br>

## License

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration & Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) Plan International Inc, Plan International Australia, Jembi Health Systems NPC and Vital Strategies Inc.
