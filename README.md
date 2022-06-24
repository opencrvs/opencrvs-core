<p align="center"> <a href="https://www.opencrvs.org"><img src="https://i.imgur.com/W7ULmox.png" title="source: imgur.com" / style="max-width:100%;"width="72" height="72"></a>
</p>
<h3 align="center">OpenCRVS</h3>
<p align="center"> A digital public good for civil registration
<br>
<a href="https://github.com/opencrvs/opencrvs-core/issues">Report an issue</a>  ·  <a href="https://community.opencrvs.org">Join our community</a>  ·  <a href="https://documentation.opencrvs.org">Read our documentation</a>  ·  <a href="https://www.opencrvs.org">www.opencrvs.org</a></p>

[![codecov](https://codecov.io/gh/opencrvs/opencrvs-core/branch/master/graph/badge.svg)](https://codecov.io/gh/opencrvs/opencrvs-core)[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [OpenCRVS](#opencrvs)
- [Important! Please read](#important-please-read)
- [Install dependencies](#install-dependencies)
- [Install OpenCRVS](#install-opencrvs)
- [Log into OpenCRVS](#log-into-opencrvs)
  - [Field Agent](#field-agent)
  - [Registration Agent](#registration-agent)
  - [Registrar](#registrar)
  - [Local System Admin](#local-system-admin)
  - [National System Admin](#national-system-admin)
  - [National Registrar](#national-registrar)
  - [Performance Manager](#performance-manager)
- [Starting and stopping OpenCRVS](#starting-and-stopping-opencrvs)
  - [Starting](#starting)
  - [Stopping](#stopping)
- [Other servers](#other-servers)
  - [React Storybook](#react-storybook)
  - [OpenHIM](#openhim)
- [Configuring OpenCRVS](#configuring-opencrvs)
- [Become part of the OpenCRVS Community](#become-part-of-the-opencrvs-community)
- [Contributing](#contributing)
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

Read review our [documentation](http://documentation.opencrvs.org) for all the information you need. This README only contains instructions on how to set up a local demo development environment.

## Install dependencies

Dependencies are required. Ensure you have satisfied all the following requirements before continuing:

- **Operation system**: Linux or Unix operating system is required: OpenCRVS has been tested on Ubuntu 18.04.6, 20.04.3, Mac OSX BigSur & Mac OSX Monterey: If you do not have Ubuntu or MacOSX, investigate installing a [virtual](https://www.virtualbox.org/) [Ubuntu](https://ubuntu.com/download/desktop) environment on your computer.
- **Admin rights**: You must have admin rights over your computer and a sudo password
- **Disk space and RAM:** A minimum of 20GB of hard drive space available and at least 16GB of RAM. If you are using virtualisation, ensure this is dedicated to the environment.
- **Docker**: On Ubuntu, install [Docker](https://docs.docker.com/engine/install/ubuntu/) & [Docker Compose](https://docs.docker.com/compose/install/). On Mac, install [Docker for Mac](https://docs.docker.com/desktop/mac/install/). On Mac, in Docker for Mac preferences, assign 4 CPUs, at least 8GB Memory or more, Swap 4GB and 4 CPUs if your system allows. Elastic search needs a lot of memory to run. On Ubuntu we set enough RAM automatically. OpenCRVS has been tested on Docker version 20.10.11 and docker-compose version 1.29.2
- **Nodejs:** You must install Node v.14.15.0, v14.15.4, 14.17.0 or v14.18.1 (this release has been tested on those versions) using [Node Version Manager](https://nodejs.org/en/download/package-manager/#nvm). OpenCRVS has not been tested on newer versions of Node and you may experience issues if you are using an untested Node version.
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

Ibombo District in Central Province is our fake country Farajaland's capital district.

Ilanga District in Sulaka Province is meant to demonstrate a provincial district office in our fake country, Farajaland.

### Field Agent

A Social Worker in an urban district:

Username: **kalusha.bwalya** / Password: **test** / SMS code: **000000** / Office: **Ibombo District, Central Province**

A Local Leader in a provincial district:

Username: **patrick.gondwe** / Password: **test** / SMS code: **000000** / Office: **Ilanga District, Sulaka Province**

### Registration Agent

Username: **felix.katongo** / Password: **test** / SMS code: **000000** / Office: **Ibombo District, Central Province**

Username: **joshua.mutale** / Password: **test** / SMS code: **000000** / Office: **Ilanga District, Sulaka Province**

### Registrar

Username: **kennedy.mweene** / Password: **test** / SMS code: **000000** / Office: **Ibombo District, Central Province**

Username: **derrick.bulaya** / Password: **test** / SMS code: **000000** / Office: **Ilanga District, Sulaka Province**

### Local System Admin

Username: **emmanuel.mayuka** / Password: **test** / SMS code: **000000** / Office: **Ibombo District, Central Province**

Username: **alex.ngonga** / Password: **test** / SMS code: **000000** / Office: **Ilanga District, Sulaka Province**

### National System Admin

Based in the country HQ Office:

Username: **jonathan.campbell** / Password: **test** / SMS code: **000000** / Office: **HQ Office, Isamba District, Central Province**

### National Registrar

Based in the country HQ Office:

Username: **joseph.musonda** / Password: **test** / SMS code: **000000** / Office: **HQ Office, Isamba District, Central Province**

### Performance Manager

Based in the country HQ Office:

Username: **edgar.kazembe** / Password: **test** / SMS code: **000000** / Office: **HQ Office, Isamba District, Central Province**

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

### OpenHIM

OpenHIM is designed to ease interoperability between OpenCRVS and external systems such as Health & National ID. It provides external access to the system via secure APIs. OpenHIM channels and governs internal transactions, routing, orchestrating and translating requests into [FHIR](https://www.hl7.org/fhir/) between services and the database layer.

1. Visit [`http://localhost:8888/#!/login`](http://localhost:8888/#!/login)
2. Login. username: **root@openhim.org** / Password: **password**

   When logging into OpenCRVS core locally, OpenHIM will display an error " ..if you are using a self-signed certificate, you may first need to instruct your browser to accept it.

   You can do so by accessing the following link." Click the link, and you will see the Chrome: Your connection is not private" error.

   This is nothing to worry about as when deploying OpenCRVS core to a server, our Traefik service provisions a LetsEncrypt SSL cert across the entire stack. Click "Advanced" & "Proceed to localhost (unsafe)". You will see output like this `{"master":655.1310464,"now":1642447245037}`.

   You can now go back to this OpenHIM link and login again freely: **[http://localhost:8888/#!/login](http://localhost:8888/#!/login)**

## Configuring OpenCRVS

A companion example country configuration for Farajaland is checked out for you automatically using our setup script above. This country configuration server runs alongside opencrvs-core and serves languages, form configuration, logo files, adminisrative structure (jurisdictions and offices) etc. To see the code, learn more and fork for your requirements, visit our [documentation](http://documentation.opencrvs.org). The example country configuration repo. [opencrvs-farajaland](https://github.com/opencrvs/opencrvs-farajaland).

<br>

## Become part of the OpenCRVS Community

We want to see OpenCRVS implemented across the world. We can’t do this alone. Through the OpenCRVS Community, we are uniting experts in civil registration and other interested parties.

[Visit our website](https://www.opencrvs.org)

[Join our community](https://community.opencrvs.org)

<br>

## Contributing

You may view/add issues here: https://github.com/opencrvs/opencrvs-core/issues

To contribute code, please review the CONTRIBUTING.md file https://github.com/opencrvs/opencrvs-core/blob/master/CONTRIBUTING.md, fork the repository and submit a pull request. The authors will review the code and merge it in if all is well.

By contributing to the OpenCRVS code, you are conforming to the terms of the license below.

<br>

## License

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration & Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) Plan International Inc, Plan International Australia, Jembi Health Systems NPC and Vital Strategies Inc.
