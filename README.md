<p align="center"> <a href="https://imgur.com/mGNCIvh"><img src="https://i.imgur.com/mGNCIvh.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">OpenCRVS</h3>
<p align="center"> A global solution to civil registration
<br>
<a href="https://github.com/opencrvs/opencrvs-core/issues">Report an issue</a>  ·  <a href="https://www.opencrvs.org/case-studies">Case studies</a>  ·  <a href="https://www.opencrvs.org/implementation">Implementations</a>  ·  <a href="https://www.opencrvs.org/about-us">About us</a></p>

[![Build Status](https://travis-ci.org/opencrvs/opencrvs-core.svg?branch=master)](https://travis-ci.org/opencrvs/opencrvs-core) [![codecov](https://codecov.io/gh/opencrvs/opencrvs-core/branch/master/graph/badge.svg)](https://codecov.io/gh/opencrvs/opencrvs-core)[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [OpenCRVS](#opencrvs)
- [Read the docs](#read-the-docs)
- [Preparing for installation](#preparing-for-installation)
- [What are the key OpenSource dependencies of OpenCRVS?](#what-are-the-key-opensource-dependencies-of-opencrvs)
- [What is inside the OpenCRVS packages?](#what-is-inside-the-opencrvs-packages)
- [What about end-to-end UI testing?](#what-about-end-to-end-ui-testing)
- [Why Docker Swarm? ...and is there Kubernetes support?](#why-docker-swarm-and-is-there-kubernetes-support)
- [OK. How do I set up a development environment?](#ok-how-do-i-set-up-a-development-environment)
- [How do I configure and localise OpenCRVS?](#how-do-i-configure-and-localise-opencrvs)
- [How can I test OpenCRVS locally on an Android device?](#how-can-i-test-opencrvs-locally-on-an-android-device)
- [How can I set up continuous integration and delivery?](#how-can-i-set-up-continuous-integration-and-delivery)
- [How can I install and manage an OpenCRVS server cluster?](#how-can-i-install-and-manage-an-opencrvs-server-cluster)
- [Clearing and creating your own reference data in your resources module](#clearing-and-creating-your-own-reference-data-in-your-resources-module)
- [Create a new metadata db dump in your resources module](#create-a-new-metadata-db-dump-in-your-resources-module)
- [Docker scripts](#docker-scripts)
- [How can I deploy to a staging environment cluster?](#how-can-i-deploy-to-a-staging-environment-cluster)
- [How can I deploy to a QA environment cluster?](#how-can-i-deploy-to-a-qa-environment-cluster)
- [How can I deploy to production?](#how-can-i-deploy-to-production)
- [How do I export recent registrations?](#how-do-i-export-recent-registrations)
- [How does OpenCRVS back up registration data?](#how-does-opencrvs-back-up-registration-data)
- [Become part of the OpenCRVS Community](#become-part-of-the-opencrvs-community)
- [Contributing](#contributing)
- [How to tag an OpenCRVS release?](#how-to-tag-an-opencrvs-release)
- [Is OpenCRVS live anywhere, and what functionality is currently available in the latest release?](#is-opencrvs-live-anywhere-and-what-functionality-is-currently-available-in-the-latest-release)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## OpenCRVS

<p align="left">

<img width="844" height="421" src="https://static.wixstatic.com/media/93440e_c5d62bf627ab4edf9d7100441eb9e01c~mv2_d_5500_3694_s_4_2.png/v1/crop/x_0,y_345,w_5500,h_2749/fill/w_844,h_421,al_c,q_80,usm_0.66_1.00_0.01/oCRVS_MockupALL.webp">

</p>

**_We are on a mission to ensure that every individual on the planet is recognised, protected and provided for from birth._**

[OpenCRVS](https://www.opencrvs.org) (Civil registration & Vital Statistics) is a digital public good to help achieve universal civil
registration and evidence-based decision making in all country contexts.

<br />

It is a full stack & fully configurable solution for the interoperable, [civil registration](https://en.wikipedia.org/wiki/Civil_registration) services of a country. Built with [microservices](https://en.wikipedia.org/wiki/Microservices), health service compliant [HL7](http://www.hl7.org/index.cfm) - [FHIR standard](https://www.hl7.org/fhir/) [NoSQL databases](https://en.wikipedia.org/wiki/NoSQL), containerised and distributed on [Docker Swarm](https://docs.docker.com/engine/swarm/) for private or public cloud infrastructure, and accessible to front line staff by a multi-lingual, [offline & low connectivity](https://developers.google.com/web/progressive-web-apps) capable mobile web application, an admin system and a performance analytics dashboard.

<br>

## Read the docs

Before going further, you should read the [Documentation](http://documentation.opencrvs.org/).

A companion example configuration; the OpenCRVS **Resources** package for Zambia, can be found on [GitHub](https://github.com/opencrvs/opencrvs-zambia).

Both **OpenCRVS Core** and a **Resources** package are required to run OpenCRVS. When you configure OpenCRVS for your country, you will need to duplicate and make your own **Resources** package.

## Preparing for installation

- Read the [technical documentation](http://documentation.opencrvs.org/opencrvs-core/docs/technology/technologyIntroduction).
- OpenCRVS uses some exciting tools. Take some time to understand the dependencies below.

When you clone this **OpenCRVS Core** repository, you are downloading:

- All of our microservices and the mobile, progressive web application as [Lerna](https://github.com/lerna/lerna) packages.
- [Docker compose](https://docs.docker.com/compose/) files to run a development environment and deploy OpenCRVS.
- An Infrastructure folder, containing [Ansible](https://www.ansible.com/) setup, [OpenHIM](http://openhim.org/) [configuration](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/openhim-base-config.json), [Netdata](https://www.netdata.cloud/) configuration, [Hearth](https://github.com/jembi/hearth) plugins, [ElasticSearch](https://www.elastic.co/) configuration, [Traefik](https://containo.us/traefik/) configuration and a number of essential scripts required to automate deployment, netweorking and backup.

Now, take some time to understand the directory structure. Read more about what all the packages are for below.

Now you are ready to follow the step-by-step development environment [installation](https://github.com/opencrvs/opencrvs-core#ok-how-do-i-set-up-a-development-environment) instructions. At a high level you will be required to:

- Install some basic dependencies for your workstation.
- Clone the repo and install some application dependencies.
- Run a single command to start **OpenCRVS Core** and the OpenCRVS **Resources** module in Docker on your workstation
- Install a base configuration for OpenHIM
- Populate your local Mongo DB with reference data and test users for the Zambia configuration.

If you have any issues, we would love to know so that we can improve our documentation. Please talk to us on [Gitter](https://gitter.im/opencrvs/community#).

<br>

### What are the key OpenSource dependencies of OpenCRVS?

When you run an installation, the following dependencies are automatically provisioned alongside the OpenCRVS Core on your infrastructure in [docker](https://www.docker.com/) containers.

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

2. [commons](https://github.com/opencrvs/opencrvs-core/tree/master/packages/commons) - a shared library package for Node methods used by multiple microservices.

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

### What about end-to-end UI testing?

Besides the thorough unit testing coverage with Jest, we supply e2e UI test scripts using [Cypress](https://www.cypress.io/). Built in modern JavaScript with Typescript support, Cypress beats Selenium's capabilities in multiple ways.

Because the OpenCRVS UI is completely configurable to your country, the end-to-end testing [scripts](https://github.com/opencrvs/opencrvs-zambia/tree/master/cypress) are located in the companion reources module described in the development environment setup instructions in this README. The resources module is bespoke for your country and we release a [Zambian](https://github.com/opencrvs/opencrvs-zambia) example.

<br>

## Why Docker Swarm? ...and is there Kubernetes support?

[Docker Swarm](https://docs.docker.com/engine/swarm/) was chosen for it's simplicity, so that previously unskilled system administrators can quickly up-skill in the techniques of private and public cloud infrastructure management. We wanted to democratise the containerisation benefits of AWS/Kubernetes style public cloud deployments for developing nations.

Some nations may be located far from a developed world datacentre. Many nations may not be able to legally support international data storage of citizen data. Often getting the legal approval requires regulatory change which obviously can take some time. In the short term, these nations may not have access to the development skills necessary to manage a complicated distributed cloud deployment, so ease-of-use is paramount.

Docker Swarm makes it easy to commence service distribution privately and then migrate publically when an organisation is ready to do so. Docker Swarm automatically configures a "round robin" load balanced cluster, and provides Service Discovery out-the-box.

We are working on a [Kubernetes](https://kubernetes.io/) Software-As-A-Service solution, so that smaller nations can hand over system administration to a 3rd party to manage solely in the public cloud, if these nations can get regulatory approval.

<br>

## OK. How do I set up a development environment?

Now that you have a good backround in the OpenCRVS core, it is time to set up a local development environment.

1. First, make sure your environment is prepared by installing these pre-requisites:

   - [Node.js](https://nodejs.org/en/download/) - using [node version manager](https://github.com/creationix/nvm) is also useful for installing node.
   - [Yarn](https://yarnpkg.com/lang/en/docs/install)
   - [Docker](https://docs.docker.com/install/) - if on linux you will need to make sure docker can be run by your user, not only by root or using sudo - see [here](https://docs.docker.com/install/linux/linux-postinstall/).

   On Linux you will also need to:

   - increase your file watch limit using: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
   - increase vm max heap for [ElasticSearch](https://www.elastic.co/) using: `echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

   On Mac you will need:

   - [Docker For Mac](https://docs.docker.com/docker-for-mac/)

2. Next, clone this repo! :)
   `git clone https://github.com/opencrvs/opencrvs-core.git`

3. `cd` into the repo and run `chmod 775 data/elasticsearch` from root of the project to allow ElasticSearch access

4. Run `yarn` to install deps

5. Run `docker swarm init` - your localhost has to be a Docker swarm manager in order to use the "overlay" network.

6. Next, OpenCRVS depends upon your own country specific "resources" module of reference data (addresses, employees, offices, facilities), custom configuration of vital event registration forms and your own integrations.

A test "resources" module for [Zambia](https://github.com/opencrvs/opencrvs-zambia) is released for free.

`cd ../` back up and clone this example [Zambia](https://github.com/opencrvs/opencrvs-zambia) resources module. You can iterate upon it for your needs.

`git clone https://github.com/opencrvs/opencrvs-zambia.git`

7. Set the following environment variables locally. The first is the path locally to where you just cloned the resources module:

`export RESOURCES_PATH=<path to your resources module>`

The second is the country code you are using in the resources module, eg: **zmb**

`export COUNTRY_CODE=zmb`

You need to pass a comma delimited string of supported languages to the `yarn dev` command in order to start the stack.

OpenCRVS has the capability to be fully multi-lingual and languages can be configured.

Client Application: Internationalisation and languages can be configured in [client.json](https://github.com/opencrvs/opencrvs-zambia/blob/master/src/zmb/features/languages/generated/client/client.json).

SMS Notifications: Internationalisation and languages can be configured in [notification.json](https://github.com/opencrvs/opencrvs-zambia/blob/master/src/zmb/features/languages/generated/notification/notification.json).

We have provided some handy tools in the test "resources" module for [Zambia](https://github.com/opencrvs/opencrvs-zambia) to help you load your languages into a content management system such as [Contentful](https://www.contentful.com/).

OpenCRVS currently supports the standard Roman and Latin character set and Bengali. In OpenCRVS Alpha, we will need to assist you to configure core to support a new language in the language select in a pull request. We will gladly provide support to you if you want to provide translations and hugely welcome all localisation efforts.

Currently we only have Bengali and English translations. If you are planning to introduce a new language, please talk to us on [Gitter](https://gitter.im/opencrvs/community#) and submit a new translation file. We can easily enable the new language string in a PR.

Currently the supported language strings can be set to either:

**Bengali and English**

"bn,en"

**English only**

"en"

In the [Zambia](https://github.com/opencrvs/opencrvs-zambia) resources package you can see how to set up OpenCRVS with a Content Management System.

Run `yarn dev <supported-languages>` to up the OpenCRVS core dev environment (frontend and backend services in this repo start as local dev servers that will autoreload and dependencies are started via docker-compose) OR alternatively you may run the dependencies and the services in this repo separated in two diffrent terminal with `yarn compose:deps` (dependencies) and `yarn start` manually setting the supported languages string in a .env file. We also provide [tmux](https://github.com/tmuxinator/tmuxinator) commands.

**If you are using OSX:**

Docker For Mac can affect OpenCRVS ability to find containers on localhost. Find your local IP address and start the dev environment, replacing the IP address with yours, like this: `LOCAL_IP=192.168.0.5 yarn dev <supported-languages>`

8. `cd opencrvs-zambia` into the resources repo you previously installed and run `yarn` to install deps

9. Run `CERT_PUBLIC_KEY_PATH=<where your core repo is>/.secrets/public-key.pem yarn start` to run the resources module

Once your [Zambia](https://github.com/opencrvs/opencrvs-zambia) resources module is running, you will now need to populate your database with test data using the [Zambia](https://github.com/opencrvs/opencrvs-zambia) implementation.

10. Populate the database with test data from your resources module

Run `yarn db:backup:restore` to populate the database with reference data and test users for [Zambia](https://github.com/opencrvs/opencrvs-zambia).

**That's it!** You should be running OpenCRVS with test users and test locations. Apps can be found running at the following URLs:

- Login: http://localhost:3020/
- Client: http://localhost:3000/
- Styleguide: http://localhost:6060/

Login using using the following Zambia user accounts.

- **Field agent:** kalusha.bwalya
- **Registration Agent:** felix.katongo
- **Registrar:** kennedy.mweene
- **System Administrator:** emmanuel.mayuka

In development, the password is "test" and the 2-factor auth SMS code is "000000".

[Please get in touch](https://www.opencrvs.org) with us to find out more about the available business functionality for each user type, or talk to us on [Gitter](https://gitter.im/opencrvs/community#).

After logging in you should be redirected to: Client: http://localhost:3000/

UI component library will be running here: Styleguide: http://localhost:6060/

<br>

### How do I configure and localise OpenCRVS?

OpenCRVS depends upon your own country specific "resources" module of reference data (addresses, employees, offices, facilities), custom configuration of vital event registration forms and your own bespoke API integrations.

A test "resources" module for [Zambia](https://github.com/opencrvs/opencrvs-zambia) is released for free in order to illustrate how this can be done.

Just follow the instructions in the [Zambia](https://github.com/opencrvs/opencrvs-zambia) resources package or [please get in touch](https://www.opencrvs.org) with us for help. We'd love to hear from you!

<br>

## How can I test OpenCRVS locally on an Android device?

You can run a PWA on an Android device and connect to OpenCRVS running on your local network. This is the best way to work and debug service workers and do actual device testing.

1. Register to https://ngrok.com/. The free plan is enough for this.
2. Go to https://dashboard.ngrok.com/auth and get yourself an auth token
3. Create a `.env` file to `packages/mobile-proxy`

```
AUTH_TOKEN=THE_AUTH_TOKEN_YOU_GOT_HERE
```

4. Start the development environment as you normally would, but add `--ignore @opencrvs/client` to the start command. E.G. `yarn start --ignore @opencrvs/client`

5. Run `yarn start` in the mobile-proxy package
6. You should now have an ngrok url that can be used remotely on any device. It's still required to be in the same network as the host machine, as some services (login) aren't used through ngrok.

7. Build the client app `NODE_ENV=production yarn build`
8. Serve the client up in 3000 port by running `yarn serve`
9. You can now open up the address you got from the mobile proxy in your mobile browser

<br>

## How can I set up continuous integration and delivery?

We provide an example [Travis](https://travis-ci.org/) [configuration](https://github.com/opencrvs/opencrvs-core/blob/master/.travis.yml) to automate unit and end-to-end testing integration & deployment.

<br>

### How can I install and manage an OpenCRVS server cluster?

OpenCRVS should be deployed on a minimum cluster of 3 nodes, each with the following minimm specification:

#### 8 GB Memory (preferrably 16 GB) / 160 GB Disk / Ubuntu 18.04.3 (LTS) x64

To prepare your server cluster and manage the Docker Swarm, some pre-requisites and instructions are documented [here](https://github.com/opencrvs/opencrvs-core/tree/master/infrastructure/server-setup)

An [Ansible](https://www.ansible.com/) playbook script is provided [here](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook.yml) to automate the vast majority of your server cluster setup.

<br>

### Clearing and creating your own reference data in your resources module

You must read the full instructions in the companion resources module to create your own reference data. The following commands help you get back to an empty state.

1. `cd opencrvs-zambia` to return to the [Zambia](https://github.com/opencrvs/opencrvs-zambia) resources module

2. Run `yarn db:clear:all` to delete the entire local database

3. Log into the OpenHIM at [here](http://localhost:8888) to load the initial base config - default password is root@openhim.org:openhim-password (login will fail a security check as we are using self signed certs by default, follow the instructions in the error message so that Chrome recognises the SSL cert.)

4. Once logged in click Export/Import then drop the file `infrastructure/openhim-base-config.json` into the import box and click 'Import'

5. Click Channels and check all have loaded successfully.

6. Click edit, and then go to routes tab and change the value of host from service name to your local IP address.

7. Test the setup with `curl http://localhost:5001/fhir/Patient/123` you should get some JSON with a 'Not found' error.

### Create a new metadata db dump in your resources module

Start the development environment as described above, then:

1. Start the dev environment - as explained above.

2. Code reference data for your country requirements following instructions inside the README of your resources module. Then populate the database like this: `yarn populate:<<insert alpha3 country code>> && cd ../..`

3. Create new backup zip files to act as your baseline. `yarn db:backup:create <<insert country code>>`

4. Commit and push the new db dump archive files that have been created in your country folder in resources package to your private repo.

<br>

## Docker scripts

There are a number of docker scripts available via `yarn`. If you need to manage the docker containers, some of these scripts may be useful.

The `yarn compose:*` scripts only setup the dependencies in docker containers and not the applications in this repository.

- `*:build` scripts which just build the images

- `*:up` scripts which just run pre-build images in containers

- `*:down` scripts which stop and remove the containers (along with data not stored in a volume!)

A number of other useful Docker commands you will need in order to manage the swarm cluster are accessible [here](https://github.com/opencrvs/opencrvs-core/tree/master/infrastructure/server-setup)

<br>

## How can I deploy to a staging environment cluster?

To deploy to a staging environment we combine docker-compose files that are used in the docker setup above with a few others to configure the stack.

The deployment uses Docker Swarm and sets up an OpenCRVS stack containing each service with a number of replicas defined in the docker compose files. **Note:** This deployment is currently automated so that every time we push to master the build will be deployed during the CI process.

The deploy is easily executed by just running: `yarn deploy:staging --clear-data=yes --restore-metadata=yes <<insert host>> <<insert version>>` - you will need ssh access to the server for this to work.

<br>

## How can I deploy to a QA environment cluster?

Deploying to QA is much the same as above, however you may specify a version to deploy. The version can be any docker image tag. Each time master is build on CI docker images are created for that commit hash. Any of these hashes may be used as the version. In addition any time a git tag is created and pushed all the docker images will automatically build. Once complete the name of this tag can be used to deploy to the QA environment as well.

`yarn deploy:qa --clear-data=yes --restore-metadata=yes <<insert host>> <<insert version>>`

<br>

## How can I deploy to production?

Deploying to Production is much the same as deploying to QA.

`yarn deploy:prod --clear-data=yes --restore-metadata=yes <<insert host>> <<insert version>>`

<br>

## How do I export recent registrations?

You can export registrations (both death and birth) from the last n days by running a script from `infrastructure/export-registrations.sh <<insert number of days>> <<insert host>> <<insert system admin token>>`.

Would create a new .zip file `export.zip` with 2 CSV files inside of it. You can tweak the time period from inside the script if needed.

<br>

## How does OpenCRVS back up registration data?

OpenCRVS backs up all of its data by default and the [Ansible](https://www.ansible.com/) playbook script [here](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook.yml) allows you to configure a remote server in which all data will be zipped and copied to on a nightly cron job. Follow the instructions [here](https://github.com/opencrvs/opencrvs-core/tree/master/infrastructure/server-setup)

<br>

## Become part of the OpenCRVS Community

We want to see OpenCRVS implemented across the world. We can’t do this alone. Through the OpenCRVS Community, we are uniting experts in civil registration and other interested parties.

[Join the community](https://www.opencrvs.org)

[Join our Gitter community](https://gitter.im/opencrvs/community#)

<br>

## Contributing

You may view/add issues here: https://github.com/opencrvs/opencrvs-core/issues

To contribute code, please review the CONTRIBUTING.md file https://github.com/opencrvs/opencrvs-core/blob/master/CONTRIBUTING.md, fork the repository and submit a pull request. The authors will review the code and merge it in if all is well.

By contributing to the OpenCRVS code, you are conforming to the terms of the license below.

<br>

## How to tag an OpenCRVS release?

So you have contributed to core and want to make a new release as an OpenCRVS core repo admin?

1. Update all packages with the new version number according to [semver](https://semver.org/). All packages will have the same version for simplicity as they are all designed to be used together. Update all dependencies to point to the newly created versions. E.g. `client` depend on `components`, so update the dependency: Do a find and replace for `1.0.0-alpha.2` and replace with `1.0.0-alpha.3`

2. Run `yarn` to ensure there are no version errors.

3. Run `yarn test` and ensure all passed.

4. Run `git tag v<version_number>` e.g. `git tag v1.0.0-alpha.3.0`

5. Run `git push origin v<version_number>`

6. Create a [new release on Github](https://github.com/opencrvs/opencrvs-core/releases) using the tag you just pushed and including any release notes.

7. Dockerhub should automatically build the images when a new release tag is created in Git. Howver Dockerhub can sometimes timeout and you may need to compose and push the release tagged images locally. To do that, run `yarn compose:push:release`

<br>

## Is OpenCRVS live anywhere, and what functionality is currently available in the latest release?

OpenCRVS is currently released as a public Alpha, and has been deployed in 2 districts of Bangladesh in a live pilot.

A huge number of business processes have been built including end-to-end registraion of birth and death events, de-duplication, performance analytics and user management.

Throughout 2020 we will be refreshing existing functionality and releasing more user, facility and content management features in advance of a full public Beta release. [Please get in touch](https://www.opencrvs.org) with us to find out more about our roadmap & talk to us on [Gitter](https://gitter.im/opencrvs/community#).

<br>

## License

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration & Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) Plan International Inc, Plan International Australia, Jembi Health Systems NPC and Vital Strategies Inc.
