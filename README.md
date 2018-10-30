[![Build Status](https://travis-ci.com/jembi/OpenCRVS.svg?token=VAkt1HxiHGcBsXWJ7mWy&branch=master)](https://travis-ci.com/jembi/OpenCRVS) [![codecov](https://codecov.io/gh/jembi/OpenCRVS/branch/master/graph/badge.svg?token=ZDi55WmcbB)](https://codecov.io/gh/jembi/OpenCRVS)

# OpenCRVS

This repo contains the frontend components and frontend related middleware for the OpenCRVS app.

## Development environment setup

Pre-requisites:

* [Node.js](https://nodejs.org/en/download/) - using [node version manager](https://github.com/creationix/nvm) is also useful for installing node.
* [Yarn](https://yarnpkg.com/lang/en/docs/install)
* [Docker](https://docs.docker.com/install/) - if on linux you will need to make sure docker can be run by your user, not only by root or using sudo - see [here](https://docs.docker.com/install/linux/linux-postinstall/).

On Linux you will also need so increase you file watch limit using: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

Then:
1. Clone the repo
2. Run `yarn` to install deps
3. Run `yarn dev` to up the dev environment (frontend and backend services in this repo start as local dev servers that will autoreload and dependencies are started via docker-compose)
4. Run `cd packages/user-mgnt/ && yarn populate && cd ../..` to populate the db with test users.

Apps can be found running in following URLs:

* Styleguide: http://localhost:6060/
* Login: http://localhost:3020/ - A test user you can use is u: 07111111111, p: test, code: 000000
* Register: http://localhost:3000/
* Performance management: http://localhost:3001/

You can open all of them by running `yarn open`

Optional: full backend setup

4. Log into the OpenHIM at [here](http://localhost:8888) to load one initial config - default password is root@openhim.org:openhim-password (login will fail a security check as we are using self signed certs by default, follow the instructions in the error message)
5. Once logged in click Export/Import then drop the file `infrastructure/openhim-base-config.json` into the import box and click 'Import'
6. Test the setup with `curl http://localhost:5001/fhir/Patient/123` you should get some JSON with a 'Not found' error.

### tmuxed development setup

Sometimes it's nice to have the option to restart all running build processes (webpack etc). To get the dependencies and the build processes running in separate sessions you can use

`yarn dev:tmux` - to start build processes and dependencies in different sessions
`yarn dev:tmux:kill` - to kill the tmux session

You can use **ctrl + b** and arrow keys to navigate between tmux windows.

This will require installation of [tmux](https://github.com/tmux/tmux/wiki) which is `brew install tmux` on OSX and [tmuxinator](https://github.com/tmuxinator/tmuxinator) which is usually `gem install tmuxinator`.


## Docker scripts

There are a number of docker scripts available via `yarn`. `yarn dev` is the easiest command to run to get started (see above) but if you need to manage the docker containers some of these scripts may be useful.

The `yarn compose:*` scripts only setup the dependencies in docker containers and not the applications in this repository. The `yarn compose:all:*` scripts setup everything including the applications in this repository in docker containers. These scripts are useful to test everything in an environment that more closely resembles staging and/or production.

For each of the above there are:
  * base scripts which build and start the containers. E.g. `yarn compose` and `yarn compose:all`
  * `*:build` scripts which just build the images
  * `*:up` scripts which just run pre-build images in containers
  * `*:down` scripts which stop and remove the containers (along with data not stored in a volume!)

## Deploying to staging

To deploy to staging we use the same docker-compose files that are used in the docker setup above with a few minor tweaks to configure the stack for staging. The deployment uses Docker Swarm and sets up an OpenCRVS stack containing each service with a number of replicas defined in the docker compose files.

The deploy is easily executed by just running: `yarn deploy:staging` - you will need ssh access to the server for this to work.

The applications will be available here:

* [Register app](https://register.opencrvs-staging.jembi.org/)
* [Login app](https://login.opencrvs-staging.jembi.org/)
* [GraphQl gateway](https://gateway.opencrvs-staging.jembi.org/)
* [Auth service](https://auth.opencrvs-staging.jembi.org/)

Some useful commands to manage the swarm:
  * `ssh root@opencrvs-staging.jembi.org docker service ls` - see all services running in the swarm including how many replicas are running
  * `ssh root@opencrvs-staging.jembi.org docker service logs -f <service-id>` - stream the logs for a particular service (which could include logs from multiple replicas)
  * `ssh root@opencrvs-staging.jembi.org docker stack ps opencrvs` - view all tasks (containers) running in the opencrvs stack

To scale a service change the deploy->replicas setting in the corresponding compose file and run the deploy again.
