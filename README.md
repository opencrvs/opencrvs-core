<p align="center"> <a href="https://imgur.com/mGNCIvh"><img src="https://i.imgur.com/mGNCIvh.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">OpenCRVS</h3>
<p align="center"> A global solution to civil registration
<br>
<a href="_url_">Report bug</a>  ·  <a href="_url_">Case studies</a>  ·  <a href="_url_">Implementations</a>  ·  <a href="_url_">Blog</a></p>

<br>


![https://travis-ci.com/jembi/OpenCRVS.svg?token=VAkt1HxiHGcBsXWJ7mWy&branch=master](https://travis-ci.com/jembi/OpenCRVS.svg?token=VAkt1HxiHGcBsXWJ7mWy&branch=master) ![https://codecov.io/gh/jembi/OpenCRVS/branch/master/graph/badge.svg?token=ZDi55WmcbB](https://codecov.io/gh/jembi/OpenCRVS/branch/master/graph/badge.svg?token=ZDi55WmcbB)  ![https://img.shields.io/badge/License-MPL 2.0-brightgreen.svg](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)


<!-- START doctoc generated TOC please keep comment here to allow auto update --> <!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

-   OpenCRVS
    -   Why it matters
    -   The Solution
    -   Core Principles
    -   Meet the people we are building OpenCRVS for
    -   System Architecture
        -   Database Layer
        -   Business Layer
        -   Interoperability Layer
        -   Presentation Layer
    -   Become part of the OpenCRVS Community
    -   Development environment setup
        -   Server installation
        -   Manual backup setup (already done for you if you restore the pre-populated db dump)
        -   Create a new metadata db dump
        -   tmuxed development setup
    -   Docker scripts
    -   Deploying to staging
    -   Deploying to QA
    -   Setting up a new cluster of servers for OpenCRVS
    -   Release branches
    -   How to do a release
    -   Contributing
    -   License

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why it matters

An estimated 1 billion people around the world cannot officially prove their identity, and 47% of these are children. (World Bank, 2018)

For people to count, they must first be counted, and that’s what a Civil Registration and Vital Statistics (CRVS) system does, recording the details of all major life events, such as births and deaths. Birth registration is the first step in securing legal identity and accessing other basic rights like education, healthcare and social protection.

As the sole continuous source of population data, it provides the foundation for human rights, government service delivery, and the measurement of development goals. Despite this, over 100 countries around the world do not have functioning CRVS systems.


## The Solution

<p align="center"> <img width="844" height="421" src="[](https://static.wixstatic.com/media/93440e_c5d62bf627ab4edf9d7100441eb9e01c~mv2_d_5500_3694_s_4_2.png/v1/crop/x_0,y_345,w_5500,h_2749/fill/w_844,h_421,al_c,q_80,usm_0.66_1.00_0.01/oCRVS_MockupALL.webp)[https://static.wixstatic.com/media/93440e_c5d62bf627ab4edf9d7100441eb9e01c~mv2_d_5500_3694_s_4_2.png/v1/crop/x_0,y_345,w_5500,h_2749/fill/w_844,h_421,al_c,q_80,usm_0.66_1.00_0.01/oCRVS_MockupALL.webp](https://static.wixstatic.com/media/93440e_c5d62bf627ab4edf9d7100441eb9e01c~mv2_d_5500_3694_s_4_2.png/v1/crop/x_0,y_345,w_5500,h_2749/fill/w_844,h_421,al_c,q_80,usm_0.66_1.00_0.01/oCRVS_MockupALL.webp)"> </p>

Plan International is challenging the current gap in the market for a user-centric and rights-based CRVS system by leading the development of [OpenCRVS](https://www.opencrvs.org/), an open-source digital CRVS solution that is free to use, adaptable to the country context, interoperable with other government systems (e.g. health and ID systems), and rights-based to ensure it protects and provides for those most vulnerable.

<p align="center"> <img width="539" height="349" src="[](https://static.wixstatic.com/media/93440e_2f6fb54e63e7488d9b40f32cea7ca10c~mv2.png/v1/crop/x_0,y_36,w_960,h_622/fill/w_539,h_349,al_c,q_80,usm_0.66_1.00_0.01/Civil%20Registration%20and%20Linkages%20to%20Natio.webp)[https://static.wixstatic.com/media/93440e_2f6fb54e63e7488d9b40f32cea7ca10c~mv2.png/v1/crop/x_0,y_36,w_960,h_622/fill/w_539,h_349,al_c,q_80,usm_0.66_1.00_0.01/Civil](https://static.wixstatic.com/media/93440e_2f6fb54e63e7488d9b40f32cea7ca10c~mv2.png/v1/crop/x_0,y_36,w_960,h_622/fill/w_539,h_349,al_c,q_80,usm_0.66_1.00_0.01/Civil) Registration and Linkages to Natio.webp"> </p>

OpenCRVS has the potential to go well beyond the scope of traditional CRVS systems. We see OpenCRVS as a foundational identity and population data system which will support and maintain the integrity of many other service delivery, statistical and identity management functions. In particular, OpenCRVS will ensure that these functions are above all inclusive, providing a digital response to the global call to “Leave No One Behind”.

We believe in the open source principle and its potential to achieve universal civil registration and advance children’s rights, and equality for girls. From the outset we have been committed to the creation of a digital public good that is:

-   Freely available with no license fees or ties to software vendors.
-   Safe and secure using best-practice security features.
-   Fully interoperable with other government systems.
-   Data enabled for fast decision-making.
-   Based on international CRVS standards.
-   Easily configured and deployed in all country contexts.
-   Rights-based, empowering all individuals to access their basic human rights.
-   User friendly, designed by and for the people it serves.
-   Accessible and inclusive

To create OpenCRVS we have partnered with registration authorities, leading health system providers, expert software developers, and communities to design and build a global digital product that will serve the needs of end users and those being registered. We have achieved this by following international standards, digital principles for development, human-centred design and agile methodologies.

By investing in a global digital product for CRVS and using an expert technical team, we are ensuring OpenCRVS is built to the highest standards. By involving local talent, we make sure the OpenCRVS product can be locally owned, managed, and maintained.

## Core Principles

**Modularity**
Designed around “microservice” components, OpenCRVS suits every country’s scale, customisation and configuration needs by being modular, configurable & independent across the full stack.

**Security by design**
OpenCRVS is critical government infrastructure that safeguards the personal data of its citizens. We took care to follow best practices and have it independently penetration tested to UK government security standards.

**Standards driven**
The use of open interoperability and data standards such as [Health Level 7 FHIR v4 (ANSI Accredited, Fast Healthcare Interoperability Resources)](https://www.hl7.org/fhir/) provide vendor neutrality.

**Cost effectiveness**
In low resource settings, system administration and technical support needs to be cheap. OpenCRVS is deployable on either public or private cloud (following globally established frameworks and standards) reduce the Total Cost of Ownership.

**Design for poor connectivity**
Architected by designers, researchers and engineers used to field work, OpenCRVS supports low mobile reception & offline use.

**Scalability**
Schema-less & document-orientated, containerised & distributed by Docker Swarm. Architected for flexibility, huge populations and continuous high traffic.

**Performance**
Integrated with external monitoring, automated load balancing, an industry standard search engine and using GraphQL to reduce requests, OpenCRVS is super fast and resilient.

**Use of automation**
Deploying OpenCRVS is a breeze. Development / QA and production environments, code testing coverage, networking, scaling and integration testing, all provision automatically using our CI/CD pipeline. We use Ansible, Travis, Jest, Cypress, Traefik & Dockerhub.

**Big data insights**
OpenCRVS uses time-series databases to generate visualisations and perform calculations on real-time civil registration analytics, helping policy makers make more informed decisions.

## Meet the people we are building for

<p align="left"> <img width="98" height="152" src="[](https://static.wixstatic.com/media/93440e_3a9b56a792704b138602745282cc87a1~mv2.png/v1/fill/w_98,h_152,al_c,q_80,usm_0.66_1.00_0.01/93440e_3a9b56a792704b138602745282cc87a1~mv2.webp)[https://static.wixstatic.com/media/93440e_3a9b56a792704b138602745282cc87a1~mv2.png/v1/fill/w_98,h_152,al_c,q_80,usm_0.66_1.00_0.01/93440e_3a9b56a792704b138602745282cc87a1~mv2.webp](https://static.wixstatic.com/media/93440e_3a9b56a792704b138602745282cc87a1~mv2.png/v1/fill/w_98,h_152,al_c,q_80,usm_0.66_1.00_0.01/93440e_3a9b56a792704b138602745282cc87a1~mv2.webp)"> </p>

**Samira and Anir**
Registering their daughter’s birth is now affordable because they no longer have to skip days of work to make multiple visits to the registration office. The Health Worker comes to them to start the registration process and they can track progress through their mobile phone so they know when and where to collect the birth certificate. The streamlined complaints process means they can also easily report any delays or disruptions.

<p align="left"> <img width="110" height="147" src="[](https://static.wixstatic.com/media/93440e_311346446ec94a47a047541a2982bf80~mv2.png/v1/crop/x_0,y_0,w_636,h_846/fill/w_110,h_147,al_c,q_80,usm_0.66_1.00_0.01/health-worker.webp)[https://static.wixstatic.com/media/93440e_311346446ec94a47a047541a2982bf80~mv2.png/v1/crop/x_0,y_0,w_636,h_846/fill/w_110,h_147,al_c,q_80,usm_0.66_1.00_0.01/health-worker.webp](https://static.wixstatic.com/media/93440e_311346446ec94a47a047541a2982bf80~mv2.png/v1/crop/x_0,y_0,w_636,h_846/fill/w_110,h_147,al_c,q_80,usm_0.66_1.00_0.01/health-worker.webp)"> </p>

**Sophia, Community Health Worker**
Can now visit all pregnant and lactating mothers in her catchment and provide quality and continuous care to the mother and baby. This is now possible because she isn’t spending the majority of the consultation filling out the paperwork required to fulfil her duties of issuing a birth notification and administering vaccinations.

<p align="left"> <img width="82" height="169" src="[](https://static.wixstatic.com/media/93440e_1ed34365b7b94424ac0c7c32ae5b5e3c~mv2.png/v1/crop/x_0,y_0,w_443,h_907/fill/w_82,h_169,al_c,q_80,usm_0.66_1.00_0.01/raman.webp)[https://static.wixstatic.com/media/93440e_1ed34365b7b94424ac0c7c32ae5b5e3c~mv2.png/v1/crop/x_0,y_0,w_443,h_907/fill/w_82,h_169,al_c,q_80,usm_0.66_1.00_0.01/raman.webp](https://static.wixstatic.com/media/93440e_1ed34365b7b94424ac0c7c32ae5b5e3c~mv2.png/v1/crop/x_0,y_0,w_443,h_907/fill/w_82,h_169,al_c,q_80,usm_0.66_1.00_0.01/raman.webp)"> </p>

**Raman, Union Councillor**
Performance management reports can now be auto-generated presenting real-time disaggregated registration rates to the district head for planning. This increases efficiencies across budgeting and policy processes, leading to improved decision making, particularly for women and girls.

## System Architecture
OpenCRVS is configurable, interoperable and scalable to any country’s needs and makes best use of limited resources. In combination with Docker containers and Docker Swarm, all services in all architectural layers can be distributed across a public or private cloud.

### Database Layer

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_d04078ae922a4126b8e9dd3f96066505~mv2.png/v1/fill/w_136,h_39,al_c,q_80,usm_0.66_1.00_0.01/FHIR_Foundation.webp)[https://static.wixstatic.com/media/93440e_d04078ae922a4126b8e9dd3f96066505~mv2.png/v1/fill/w_136,h_39,al_c,q_80,usm_0.66_1.00_0.01/FHIR_Foundation.webp](https://static.wixstatic.com/media/93440e_d04078ae922a4126b8e9dd3f96066505~mv2.png/v1/fill/w_136,h_39,al_c,q_80,usm_0.66_1.00_0.01/FHIR_Foundation.webp)" width="136" height="39"> </p>

**Hearth**
Massively scalable and extensible, [Hearth](https://github.com/jembi/hearth) is an OpenSource NoSQL database server using interoperable Health Level 7 FHIR v4 (ANSI Accredited, Fast Healthcare Interoperability Resources) as JSON.

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_21c72b72ff3a405596448e33f80a719c~mv2_d_3422_1781_s_2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/Elasticsearch-Logo-Color-V.webp)[https://static.wixstatic.com/media/93440e_21c72b72ff3a405596448e33f80a719c~mv2_d_3422_1781_s_2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/Elasticsearch-Logo-Color-V.webp](https://static.wixstatic.com/media/93440e_21c72b72ff3a405596448e33f80a719c~mv2_d_3422_1781_s_2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/Elasticsearch-Logo-Color-V.webp)" width="136" height="70"> </p>

**ElasticSearch**
An industry standard, document orientated, real-time de-duplication / search engine. Lightning fast, intelligent civil registration record return, even with imprecise, “fuzzy” search parameters.

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_7ae07f5f77c6407080656fff4e0cdcd3~mv2.jpg/v1/fill/w_134,h_26,al_c,q_80,usm_0.66_1.00_0.01/influxdata-2.webp)[https://static.wixstatic.com/media/93440e_7ae07f5f77c6407080656fff4e0cdcd3~mv2.jpg/v1/fill/w_134,h_26,al_c,q_80,usm_0.66_1.00_0.01/influxdata-2.webp](https://static.wixstatic.com/media/93440e_7ae07f5f77c6407080656fff4e0cdcd3~mv2.jpg/v1/fill/w_134,h_26,al_c,q_80,usm_0.66_1.00_0.01/influxdata-2.webp)" width="134" height="26"> </p>

**InfluxData**
Hyper efficient and optimised, time series database for big data insights. Millisecond level query times over months of data, disaggregated by gender, location and configurable operational and statistical parameters.

### Business Layer

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_0e7fdde3dc404a8cbafdf70c18cedbc6~mv2.png/v1/fill/w_100,h_70,al_c,q_80,usm_0.66_1.00_0.01/hapi-logo.webp)[https://static.wixstatic.com/media/93440e_0e7fdde3dc404a8cbafdf70c18cedbc6~mv2.png/v1/fill/w_100,h_70,al_c,q_80,usm_0.66_1.00_0.01/hapi-logo.webp](https://static.wixstatic.com/media/93440e_0e7fdde3dc404a8cbafdf70c18cedbc6~mv2.png/v1/fill/w_100,h_70,al_c,q_80,usm_0.66_1.00_0.01/hapi-logo.webp)" width="100" height="70"> </p> <p align="center"> <img src="[](https://static.wixstatic.com/media/93440e_65930e880f9e4efc822db3d5f3ddeb8a~mv2.png/v1/fill/w_90,h_51,al_c,q_80,usm_0.66_1.00_0.01/node.webp)[https://static.wixstatic.com/media/93440e_65930e880f9e4efc822db3d5f3ddeb8a~mv2.png/v1/fill/w_90,h_51,al_c,q_80,usm_0.66_1.00_0.01/node.webp](https://static.wixstatic.com/media/93440e_65930e880f9e4efc822db3d5f3ddeb8a~mv2.png/v1/fill/w_90,h_51,al_c,q_80,usm_0.66_1.00_0.01/node.webp)" width="90" height="51"> </p> <p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_168a1efc9a3d4a47bc9282c5b684df6e~mv2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/typescript.webp)[https://static.wixstatic.com/media/93440e_168a1efc9a3d4a47bc9282c5b684df6e~mv2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/typescript.webp](https://static.wixstatic.com/media/93440e_168a1efc9a3d4a47bc9282c5b684df6e~mv2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/typescript.webp)" width="70" height="70"> </p>

**Microservices**
OpenCRVS’ microservice architecture enables continuous delivery & deployment, facilitating endless scalability and evolution of its business requirements. The microservices are written in TypeScript (a strictly typed superset of JavaScript that compiles to JavaScript) and NodeJS using the fully documented HapiJS framework.

Each microservice in OpenCRVS has no knowledge of other services or business requirements in the application, and exposes it’s capabilities via secure APIs.

### Interoperability Layer

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_bdd011d5e3744e7b84684e6789c1f5c7~mv2.png/v1/fill/w_136,h_40,al_c,q_80,usm_0.66_1.00_0.01/openhim-logo-green.webp)[https://static.wixstatic.com/media/93440e_bdd011d5e3744e7b84684e6789c1f5c7~mv2.png/v1/fill/w_136,h_40,al_c,q_80,usm_0.66_1.00_0.01/openhim-logo-green.webp](https://static.wixstatic.com/media/93440e_bdd011d5e3744e7b84684e6789c1f5c7~mv2.png/v1/fill/w_136,h_40,al_c,q_80,usm_0.66_1.00_0.01/openhim-logo-green.webp)" width="136" height="40"> </p>

**OpenHIM**
The [OpenHIM (Health Information Mediator)](https://github.com/jembi/openhim-core-js) is an enterprise service bus designed to ease interoperability between OpenCRVS and external systems such as Health, National ID. It provides access to the system via secure APIs, and governs transactions, routing, orchestrating and translating requests into FHIR v4.

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_d1ec46ba4c2d4c1dbb6afe6b9b7143de~mv2.png/v1/fill/w_133,h_40,al_c,q_80,usm_0.66_1.00_0.01/graphql.webp)[https://static.wixstatic.com/media/93440e_d1ec46ba4c2d4c1dbb6afe6b9b7143de~mv2.png/v1/fill/w_133,h_40,al_c,q_80,usm_0.66_1.00_0.01/graphql.webp](https://static.wixstatic.com/media/93440e_d1ec46ba4c2d4c1dbb6afe6b9b7143de~mv2.png/v1/fill/w_133,h_40,al_c,q_80,usm_0.66_1.00_0.01/graphql.webp)" width="133" height="40"> </p>

**GraphQL Gateway**
Using GraphQL allows OpenCRVS to perform much faster and more responsively in remote areas by drastically reducing the number of HTTP requests that are required to render a view in the presentation layer.

The OpenCRVS GraphQL Gateway is a JWT protected Apollo server that requests and resolves FHIR resources from OpenHIM into GraphQL schema, for easy consumption in the client applications.

### Presentation Layer

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_8452ed95c717459e86c95ed0e17378ad~mv2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/PWA-Progressive-Web-App-Logo.webp)[https://static.wixstatic.com/media/93440e_8452ed95c717459e86c95ed0e17378ad~mv2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/PWA-Progressive-Web-App-Logo.webp](https://static.wixstatic.com/media/93440e_8452ed95c717459e86c95ed0e17378ad~mv2.png/v1/fill/w_136,h_70,al_c,q_80,usm_0.66_1.00_0.01/PWA-Progressive-Web-App-Logo.webp)" width="136" height="70"> </p>

**Progressive Web Application**
Using an Android Progressive Web Application for our mobile registration app means that we can take advantage of offline functionality and native push notifications, without the overhead of maintaining native code and App Store deployments. In remote areas, registrars can save a configurable number of registrations offline on their mobile phone using a locally encrypted database.

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_297d9c18fc9e48e78b39e885bbfdaa13~mv2_d_1200_1204_s_2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/OAuth_svg.webp)[https://static.wixstatic.com/media/93440e_297d9c18fc9e48e78b39e885bbfdaa13~mv2_d_1200_1204_s_2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/OAuth_svg.webp](https://static.wixstatic.com/media/93440e_297d9c18fc9e48e78b39e885bbfdaa13~mv2_d_1200_1204_s_2.png/v1/fill/w_70,h_70,al_c,q_80,usm_0.66_1.00_0.01/OAuth_svg.webp)" width="70" height="70"> </p>

**Secure 2-factor authentication**
Our applications are protected by JWT 2-Factor Authentication. Our apps and microservices utilise OAuth best practices for JWT tokens. User permissions and roles are centrally managed, supporting IT organisations that conform to ISO27001 certification.

<p align="left"> <img src="[](https://static.wixstatic.com/media/93440e_50ed7c9e719e44daa7ca7d3e183f4071~mv2.png/v1/fill/w_121,h_55,al_c,q_80,usm_0.66_1.00_0.01/react.webp)[https://static.wixstatic.com/media/93440e_50ed7c9e719e44daa7ca7d3e183f4071~mv2.png/v1/fill/w_121,h_55,al_c,q_80,usm_0.66_1.00_0.01/react.webp](https://static.wixstatic.com/media/93440e_50ed7c9e719e44daa7ca7d3e183f4071~mv2.png/v1/fill/w_121,h_55,al_c,q_80,usm_0.66_1.00_0.01/react.webp)" width="122" height="55"> </p>

**React**
Modularity extends to the user interface using the React framework. All multi-lingual, civil registration form field components are generated and configured for validation using JSON so that they can be easily configured to suit legal requirements. Our full-stack javascript application makes it easy to allocate local system administration resources.

## Become part of the OpenCRVS Community
We want to see OpenCRVS implemented across the world. We can’t do this alone. Through the OpenCRVS Community, we are uniting experts in civil registration and other interested parties.

[Join the community](https://www.opencrvs.org/)

## Development environment setup

Pre-requisites:

-   [Node.js](https://nodejs.org/en/download/) - using [node version manager](https://github.com/creationix/nvm) is also useful for installing node.
-   [Yarn](https://yarnpkg.com/lang/en/docs/install)
-   [Docker](https://docs.docker.com/install/) - if on linux you will need to make sure docker can be run by your user, not only by root or using sudo - see [here](https://docs.docker.com/install/linux/linux-postinstall/).

On Linux you will also need to:

-   increase your file watch limit using: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
-   increase vm max heap for elasticsearch using: `echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
-   run `chmod 775 data/elasticsearch` from root of the project

On Mac you will need:

-   [Docker For Mac](https://docs.docker.com/docker-for-mac/)

Then:

1.  Clone the repo
2.  Run `yarn` to install deps
3.  Run `docker swarm init` - out host has to be a swarm to use the overlay network as we use in staging and qa
4.  **Starting the dev environment (necessary for Ubuntu):**Run `yarn dev` to up the dev environment (frontend and backend services in this repo start as local dev servers that will autoreload and dependencies are started via docker-compose) OR you may run the dependencies and the serviecs in this repo separated in two diffrent terminal with `yarn compose:deps` (dependencies) and `yarn start` (services in this repo) **Starting the dev environment (necessary for OSX):** Docker For Mac can affect OpenCRVS ability to find containers on localhost. Find your local IP address and start the dev environment like this: `LOCAL_IP=192.168.0.5 yarn dev`
5.  `cd packages/resources && yarn db:backup:restore <<insert country code>>` to restore a pre-populated database with user, location and facility data for your country.

That's it! You should be running OpenCRVS with test users and test locations. Apps can be found running at the following URLs:

-   Styleguide: [](http://localhost:6060/)[http://localhost:6060/](http://localhost:6060/)
-   Login: [](http://localhost:3020/)[http://localhost:3020/](http://localhost:3020/) - A test user you can use is u: sakibal.hasan, p: test, code: 000000
-   Client: [](http://localhost:3000/)[http://localhost:3000/](http://localhost:3000/)
-   Performance management: [](http://localhost:3001/)[http://localhost:3001/](http://localhost:3001/)

You can open all of them by running `yarn open`

### Server installation

An ansible script is provided to help you set up a Docker Swarm to rub OpenCRVS on Ubuntu [here](https://github.com/jembi/OpenCRVS/tree/master/infrastructure/server-setup) Detailed manual instrauctions are also available [here](https://github.com/jembi/OpenCRVS/blob/master/infrastructure/server-setup/server-setup.txt)

### Manual backup setup 

Already done for you if you restore the pre-populated db dump

1.  Log into the OpenHIM at [here](http://localhost:8888/) to load one initial config - default password is [root@openhim.org](mailto:root@openhim.org):openhim-password (login will fail a security check as we are using self signed certs by default, follow the instructions in the error message)
2.  Once logged in click Export/Import then drop the file `infrastructure/openhim-base-config.json` into the import box and click 'Import'
3.  Click Channels and check all have loaded successfully. For each channel you may need to click edit, and then go to routes tab and change the value of host from service name to your local IP address.
4.  Test the setup with `curl <http://localhost:5001/fhir/Patient/123`> you should get some JSON with a 'Not found' error.

### Create a new metadata db dump

Start the development environment as described above, then:

1.  Start the dev environment - as explained above.
2.  Populate reference data for your country requirements from the resources package. `cd packages/resource && yarn populate:<<insert alpha3 country code>> && cd ../..`
3.  `cd packages/resources && yarn db:backup:create <<insert country code>>`
4.  Commit and push the new db dump archive files that have been created in your country folder in resources package.

### tmuxed development setup
Sometimes it's nice to have the option to restart all running build processes (webpack etc). To get the dependencies and the build processes running in separate sessions you can use

`COUNTRY=<zmb|bgd> yarn dev:tmux` - to start build processes and dependencies in different sessions `yarn dev:tmux:kill` - to kill the tmux session

You can use **ctrl + b** and arrow keys to navigate between tmux windows.

This will require installation of [tmux](https://github.com/tmux/tmux/wiki) which is `brew install tmux` on OSX and [tmuxinator](https://github.com/tmuxinator/tmuxinator) which is usually `gem install tmuxinator`.

### Local PWA development setup

To expose all services with an external domain and HTTPS:

1.  Go to `ngrok.conf` and add an auth token.
2.  Run `ngrok start -config infrastructure/ngrok.conf --all`
3.  Open `https://ocrvs-client.ngrok.io` on your device

## Docker scripts

There are a number of docker scripts available via `yarn`. `yarn dev` is the easiest command to run to get started (see above) but if you need to manage the docker containers some of these scripts may be useful.

The `yarn compose:*` scripts only setup the dependencies in docker containers and not the applications in this repository.

For the command above there is:

-   base scripts which build and start the containers. E.g. `yarn compose:deps`**Troubleshooting (necessary for OSX):** If you have issue with the OpenHIM not being able to access services running locally (probably a hostname not found error) then you can try specify your IP address manually using: `LOCAL_IP=192.168.0.5 yarn compose:deps`
-   `*:build` scripts which just build the images
-   `*:up` scripts which just run pre-build images in containers
-   `*:down` scripts which stop and remove the containers (along with data not stored in a volume!)

## Deploying to staging

To deploy to staging we use the same docker-compose files that are used in the docker setup above with a few minor tweaks to configure the stack for staging. The deployment uses Docker Swarm and sets up an OpenCRVS stack containing each service with a number of replicas defined in the docker compose files. **Note:** This deployment is currently automated so that every time we push to master the build will be deployed during the CI process.

The deploy is easily executed by just running: `yarn deploy:staging <<insert country code>> --clear-data=yes --restore-metadata=yes <<insert host>> <<insert version>>` - you will need ssh access to the server for this to work.

The applications will be available here:

-   [Client app](https://register.opencrvs-staging.jembi.org/)
-   [Login app](https://login.opencrvs-staging.jembi.org/)
-   [GraphQl gateway](https://gateway.opencrvs-staging.jembi.org/)
-   [Auth service](https://auth.opencrvs-staging.jembi.org/)

Some useful commands to manage the swarm:

-   `ssh root@opencrvs-staging.jembi.org docker service ls` - see all services running in the swarm including how many replicas are running
-   `ssh root@opencrvs-staging.jembi.org docker service logs -f <service-id>` - stream the logs for a particular service (which could include logs from multiple replicas)
-   `ssh root@opencrvs-staging.jembi.org docker stack ps opencrvs` - view all tasks (containers) running in the opencrvs stack

To scale a service change the deploy->replicas setting in the corresponding compose file and run the deploy again.

## Deploying to QA

Deploying to QA is much the same as above, however you may specify a version to deploy. The version can be any docker image tag. Each time master is build on CI docker images are created for that commit hash. Any of these hashes may be used as the version. In addition any time a git tag is created and pushed all the docker images will automatically build. Once complete the name of this tag can be used to deploy to the QA environemt as well.

`yarn deploy:qa <<insert country code>> --clear-data=yes --restore-metadata=yes <<insert host>> <<insert version>>`

The applications will be available here:

-   [Client app](https://register.opencrvs.qa1.jembi.org/)
-   [Login app](https://login.opencrvs.qa1.jembi.org/)
-   [GraphQl gateway](https://gateway.opencrvs.qa1.jembi.org/)
-   [Auth service](https://auth.opencrvs.qa1.jembi.org/)

## Setting up a new cluster of servers

See the documentation here

## Release branches

When doing releases that will require hotfixes we will create a new release branch off `master` with the naming format of `release/<name_of_release>`. E.g. `git checkout -b release/bn-demo`.

All hotfixes that are done for that release should be submitted in a PR against that release branch AS WELL AS submitted to the master branch in another PR if the code is relevent to master as well. Please comment in the PRs with the link to the other PR so that they may be tracked together. The reviewer should look at both and merge them in when they are happy.

## How to do a release

1.  Update all packages with the new version number according to [semver](https://semver.org/). All packages will have the same version for simplicity as they are all designed to be used together. Update all dependencies to point to the newly created versions. E.g. `client` depend on `components`, so update the dependency: Do a find and replace for `1.0.0-alpha.2` and replace with `1.0.0-alpha.3`
2.  Run `yarn` to ensure there are no version errors.
3.  Run `yarn test` and ensure all passed.
4.  Run `git tag v<version_number>` e.g. `git tag v1.0.0-alpha.1.2`
5.  Run `git push origin v<version_number>`
6.  Create a [new release on Github](https://github.com/jembi/OpenCRVS/releases) using the tag you just pushed and including any release notes.
7.  Dockerhub should automatically build the images when a new release tag is created in Git. Howver Dockerhub can sometimes timeout and you may need to compose and push the release tagged images locally. To do that, run `yarn compose:push:release`

## How do I export recent registrations?

You can export registrations (both death and birth) from the last 7 days by running a script from `infrastructure/export-last-7-days.sh`.

For example running: `./infrastructure/export-last-7-days.sh opencrvs.qa1.jembi.org api.user test`

Would create a new .zip file `export.zip` with 2 CSV files inside of it. You can tweak the time period from inside the script if needed.

## Contributing

You may view/add issues here: [](https://github.com/jembi/OpenCRVS/issues)[https://github.com/jembi/OpenCRVS/issues](https://github.com/jembi/OpenCRVS/issues)

To contribute code, please review the [CONTRIBUTING.md](http://contributing.md/) file [](https://github.com/jembi/OpenCRVS/blob/master/CONTRIBUTING.md)[https://github.com/jembi/OpenCRVS/blob/master/CONTRIBUTING.md](https://github.com/jembi/OpenCRVS/blob/master/CONTRIBUTING.md), fork the repository and submit a pull request. The authors will review the code and merge it in if all is well.

By contributing to the OpenCRVS code, you are conforming to the terms of the license below.

## License

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at [](https://mozilla.org/MPL/2.0/)[https://mozilla.org/MPL/2.0/](https://mozilla.org/MPL/2.0/).

OpenCRVS is also distributed under the terms of the Civil Registration & Healthcare Disclaimer located at [](http://opencrvs.org/license)[http://opencrvs.org/license](http://opencrvs.org/license).

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS graphic logo are (registered/a) trademark(s) of Plan International.
