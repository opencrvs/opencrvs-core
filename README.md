<p align="center"> <a href="https://imgur.com/mGNCIvh"><img src="https://i.imgur.com/mGNCIvh.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">OpenCRVS</h3>
<p align="center"> A [digital public good](https://digitalpublicgoods.net/) for [civil registration](https://en.wikipedia.org/wiki/Civil_registration)
<br>
<a href="https://github.com/opencrvs/opencrvs-core/issues">Report an issue</a>  ·  <a href="https://www.opencrvs.org/case-studies">Case studies</a>  ·  <a href="https://www.opencrvs.org/implementation">Implementations</a>  ·  <a href="https://www.opencrvs.org/about-us">About us</a></p>

[![Build Status](https://travis-ci.org/opencrvs/opencrvs-core.svg?branch=master)](https://travis-ci.org/opencrvs/opencrvs-core) [![codecov](https://codecov.io/gh/opencrvs/opencrvs-core/branch/master/graph/badge.svg)](https://codecov.io/gh/opencrvs/opencrvs-core)[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [OpenCRVS](#opencrvs)
- [Presumed experience for developers checking out this software](#presumed-experience-for-developers-checking-out-this-software)
- [Install these dependencies](#install-these-dependencies)
- [First time setup](#first-time-setup)
- [Starting and stopping OpenCRVS](#starting-and-stopping-opencrvs)
  - [Starting OpenCRVS](#starting-opencrvs)
  - [Stopping OpenCRVS](#stopping-opencrvs)
- [Read the docs](#read-the-docs)
- [Learn more](#learn-more)
- [Configure OpenCRVS for your country](#configure-opencrvs-for-your-country)
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

<p align="left">

<img width="844" height="421" src="https://static.wixstatic.com/media/93440e_c5d62bf627ab4edf9d7100441eb9e01c~mv2_d_5500_3694_s_4_2.png/v1/crop/x_0,y_345,w_5500,h_2749/fill/w_844,h_421,al_c,q_80,usm_0.66_1.00_0.01/oCRVS_MockupALL.webp">

</p>

**_We are on a mission to ensure that every individual on the planet is recognised, protected and provided for from birth._**

[OpenCRVS](https://www.opencrvs.org) (Civil registration & Vital Statistics) is a digital public good to help achieve universal civil
registration and evidence-based decision making in all country contexts.

<br>

## Presumed experience for developers checking out this software

In order to run OpenCRVS, we expect that you have a working knowledge of Linux / Unix operating systems and can run Terminal commands. OpenCRVS consists of multiple servers which run in Docker containers and requires Node JS. You should be familiar with the concepts of Docker and Node JS web application software development.

Install the dependencies and follow the first time setup instructions. This will checkout, download, install, configure and start all the servers for you in order to get up and running quickly with OpenCRVS.

<br>

## Install these dependencies

Dependencies are required. Ensure you have satisfied ALL the following requirements before continuing:

- You have a working Linux or Unix operating system: e.g. Ubuntu or Mac OSX: If you do not have Ubuntu or MacOSX, investigate installing a [virtual](https://www.virtualbox.org/) [Ubuntu](https://ubuntu.com/download/desktop) environment on your computer.
- You need a minimum of 10GB of hard drive space available and at least 8GB of RAM. If you are using virtualisation, ensure this is dedicated to the environment.
- On Ubuntu, install [Docker](https://docs.docker.com/engine/install/ubuntu/) & [Docker Compose](https://docs.docker.com/compose/install/). On Mac, install [Docker for Mac](https://docs.docker.com/desktop/mac/install/)
- The Node runtime is required. We recommend you install Node v.14.15.0, v14.15.4, 14.17.0 or v14.18.1 as this release has been tested on those versions. There are various ways you can install Node. The easiest way to get Node running with the version of your choice is using [Node Version Manager](https://nodejs.org/en/download/package-manager/#nvm).
- You need to install the Yarn Package Manager for Node. The documentation is [here](https://classic.yarnpkg.com/en/docs/install)
- You should install the Chrome web browser. The OpenCRVS client application is a progressive web application. It is best experienced using [Google Chrome](https://www.google.com/chrome).
- OpenCRVS requires multiple terminal windows open in order to run OpenCRVS Core alongside the default country configuration. Our setup script uses the tool tmux to do this. On Ubuntu run: `sudo apt-get install tmux` to install. On Mac, you can install tmux using Homebrew or MacPorts. [tmux wiki](https://github.com/tmux/tmux/wiki)

<br>

## First time setup

Now you have satisfied the dependencies, run the following **ONE TIME ONLY** command to install OpenCRVS.

**The setup command tests your dependencies, downloads and installs all Docker images, checks out the example OpenCRVS country configuration, runs all OpenCRVS Core microservices, runs the OpenCRVS Zambia country configuration and populates local databases with Zambia country configuration reference data required in order to demo OpenCRVS. The script requries internet connectivity and takes approximately 15 minutes to complete.**

If there are any missing dependencies the script will exit and display instructions. Once the dependency is satisfied, you can try again.

`bash setup.sh`

**When the script completes, you will see the OpenCRVS logo in one of the tmux terminal windows.**
**Once this command completes, you should not run it again. Instead, use the start up commands to start and stop OpenCRVS explained later in this README.**

When fully installed and running, you will see the following information in one of the tmux windows...

1. You can log in to OpenCRVS on this url: **[http://localhost:3020/](http://localhost:3020/)**

User details are:

Field Agent role: Username: **kalusha.bwalya** / Password: **test** / Test two-factor authentication SMS code: **000000**

Registration Agent role: Username: **felix.katongo** / Password: **test** / Test two-factor authentication SMS code: **000000**

Registrar role: Username: **kennedy.mweene** / Password: **test** / Test two-factor authentication SMS code: **000000**

Local System Admin: Username: **emmanuel.mayuka** / Password: **test** / Test two-factor authentication SMS code: **000000**

National System Admin: Username: **jonathan.campbell** / Password: **test** / Test two-factor authentication SMS code: **000000**

To learn about these user roles and to perform civil registration tasks, read the [Documentation](http://documentation.opencrvs.org/).

You can browse to other interesting servers such as:

2. The React Storybook component styleguide, available here: **[http://localhost:6060/](http://localhost:6060/)**

3. The OpenHIM NodeJS enterprise service bus available here: **[http://localhost:8888/#!/login](http://localhost:8888/#!/login)**

OpenHIM access details: Username: **root@openhim.org** / Password: **password**

OpenHIM is designed to ease interoperability between OpenCRVS and external systems such as Health & National ID. It provides external access to the system via secure APIs. OpenHIM channels and governs internal transactions, routing, orchestrating and translating requests into [FHIR](https://www.hl7.org/fhir/) between services and the database layer.

When logging into OpenCRVS core locally, OpenHIM will display an error " ..if you are using a self-signed certificate, you may first need to instruct your browser to accept it. You can do so by accessing the following link." Click the link, and you will see the Chrome: Your connection is not private" error. This is nothing to worry about as when deploying OpenCRVS core to a server, our Traefik service provisions a LetsEncrypt SSL cert across the entire stack. Click "Advanced" & "Proceed to localhost (unsafe)". You will see output like this:

`{"master":655.1310464,"now":1642447245037}`

You can now go back to this OpenHIM link and login again freely: **[http://localhost:8888/#!/login](http://localhost:8888/#!/login)**

4. To quit OpenCRVS: press **Ctrl+C** in each terminal and type `exit` in each terminal to close the tmux window.

<br>

## Starting and stopping OpenCRVS

After quitting the setup process above. If you want to start and stop opencrvs-core and the country configuration server, use the following commands

### Starting OpenCRVS

The setup script will have installed the [opencrvs-zambia country configuration](https://github.com/opencrvs/opencrvs-zambia) in a directory alongside opencrvs-core.
The country configuration is a separate server that must be started and stopped alongside opencrvs-core.

1. You need to pass the absolute path to opencrvs-core as a parameter when starting the country configuration. First you can output the path by entering the following command in the opencrvs-core directory:

`pwd`

2. Copy the path to save it in your clipboard.

3. To start up opencrvs-core, run:

`yarn dev`

If you did not previously run our setup command, Docker will have to download Mongo DB, ElasticSearch, OpenHIM and Hearth docker images. These are large files. Then docker will build them and you will see Mongo errors output for a long time until Mongo is running.

If you did run our setup command, OpenCRVS will start much faster.

Wait for the OpenCRVS client app to build completely (output will stop and you will see the message: @opencrvs/client: Compiled with warnings. Along with TypeScript/Node dependency warnings... ), then OpenCRVS Core will be available.

4. In a new terminal window, cd into the opencrvs-zambia repo. e.g. if you used our setup script, it will be here:

`cd ../opencrvs-zambia`

5. Now start the country configuration server by running:

`yarn dev <!-- paste in the absolute path to your opencrvs-core directory here -->`

### Stopping OpenCRVS

To quit: press **Ctrl+C** in the 2 terminal windows you have open to quit opencrvs-core and opencrvs-zambia respectively.

<br>

## Read the docs

Before going further, you should read the [Documentation](http://documentation.opencrvs.org/).

<br>

## Learn more

**_We are on a mission to ensure that every individual on the planet is recognised, protected and provided for from birth._**

[OpenCRVS](https://www.opencrvs.org) (Civil registration & Vital Statistics) is a digital public good to help achieve universal civil
registration and evidence-based decision making in all country contexts.

<br>

## Configure OpenCRVS for your country

A companion example country cnfiguration for Zambia is checked out for you automatically using our setup script above. This country configuration server runs alongside opencrvs-core and serves languages, form configuration, logo files, adminisrative structure (jurisdictions and offices) etc. To see the code, learn more and fork for your requirements, visit the repo. [opencrvs-zambia](https://github.com/opencrvs/opencrvs-zambia).

<br>

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

Because the OpenCRVS UI is completely configurable to your country, the end-to-end testing scripts are located in the [example country configuration server for Zambia.](https://github.com/opencrvs/opencrvs-zambia/tree/master/cypress)

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

4. Run `git tag v<version_number>` e.g. `git tag v1.0.0-alpha.3.0`

5. Run `git push origin v<version_number>`

6. Create a [new release on Github](https://github.com/opencrvs/opencrvs-core/releases) using the tag you just pushed and including any release notes.

7. Dockerhub should automatically build the images when a new release tag is created in Git. Howver Dockerhub can sometimes timeout and you may need to compose and push the release tagged images locally. To do that, run `yarn compose:push:release`

<br>

## License

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration & Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) Plan International Inc, Plan International Australia, Jembi Health Systems NPC and Vital Strategies Inc.
