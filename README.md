[![Build Status](https://travis-ci.com/jembi/OpenCRVS.svg?token=VAkt1HxiHGcBsXWJ7mWy&branch=master)](https://travis-ci.com/jembi/OpenCRVS) [![codecov](https://codecov.io/gh/jembi/OpenCRVS/branch/master/graph/badge.svg?token=ZDi55WmcbB)](https://codecov.io/gh/jembi/OpenCRVS)

# OpenCRVS

This repo contains the frontend components and frontend related middleware for the OpenCRVS app.

## Development environment setup

Pre-requisites:

- [Node.js](https://nodejs.org/en/download/) - using [node version manager](https://github.com/creationix/nvm) is also useful for installing node.
- [Yarn](https://yarnpkg.com/lang/en/docs/install)
- [Docker](https://docs.docker.com/install/) - if on linux you will need to make sure docker can be run by your user, not only by root or using sudo - see [here](https://docs.docker.com/install/linux/linux-postinstall/).

On Linux you will also need to:

- increase your file watch limit using: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
- increase vm max heap for elasticsearch using: `echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
- run `chmod 775 data/elasticsearch` from root of the project

Then:

1. Clone the repo
2. Run `yarn` to install deps
3. Run `docker swarm init` - out host has to be a swarm to use the overlay network as we use in staging and qa
4. Run `yarn dev` to up the dev environment (frontend and backend services in this repo start as local dev servers that will autoreload and dependencies are started via docker-compose) OR you may run the dependencies and the serviecs in this repo separated in two diffrent terminal with `yarn compose` (dependencies) and `yarn start` (services in this repo)
5. Run `yarn db:backup:restore` to restore a pre-populated database with user, location and facility data.

Apps can be found running in following URLs:

- Styleguide: http://localhost:6060/
- Login: http://localhost:3020/ - A test user you can use is u: 07111111111, p: test, code: 000000
- Register: http://localhost:3000/
- Performance management: http://localhost:3001/

You can open all of them by running `yarn open`

**Troubleshooting (necessary for OSX):** If you have issue with the OpenHIM not being able to access services running locally (probably a hostname not found error) then you can try specify your IP address manually using: `LOCAL_IP=192.168.0.5 yarn compose`

### Manual backup setup (already done for you if you restore the pre-populated db dump)

1. Log into the OpenHIM at [here](http://localhost:8888) to load one initial config - default password is root@openhim.org:openhim-password (login will fail a security check as we are using self signed certs by default, follow the instructions in the error message)
2. Once logged in click Export/Import then drop the file `infrastructure/openhim-base-config.json` into the import box and click 'Import'
3. Click Channels and for each channel -
   1. click edit, and then go to routes tab and change the value of host from service name to your local IP address.
4. Test the setup with `curl http://localhost:5001/fhir/Patient/123` you should get some JSON with a 'Not found' error.

### Create a new metadata db dump

Start the development environment as described above, then:

1. `cd packages/resource && yarn populate && cd ../..`
2. `cd packages/user-mgnt && yarn populate && cd ../..`
3. Login to the OpenHIM console and upload the base config file.
4. `yarn db:backup:create`
5. Commit and push the new db dump archive files that have been created.

### tmuxed development setup

Sometimes it's nice to have the option to restart all running build processes (webpack etc). To get the dependencies and the build processes running in separate sessions you can use

`yarn dev:tmux` - to start build processes and dependencies in different sessions
`yarn dev:tmux:kill` - to kill the tmux session

You can use **ctrl + b** and arrow keys to navigate between tmux windows.

This will require installation of [tmux](https://github.com/tmux/tmux/wiki) which is `brew install tmux` on OSX and [tmuxinator](https://github.com/tmuxinator/tmuxinator) which is usually `gem install tmuxinator`.

## Docker scripts

There are a number of docker scripts available via `yarn`. `yarn dev` is the easiest command to run to get started (see above) but if you need to manage the docker containers some of these scripts may be useful.

The `yarn compose:*` scripts only setup the dependencies in docker containers and not the applications in this repository.

For the command above there is:

- base scripts which build and start the containers. E.g. `yarn compose`
- `*:build` scripts which just build the images
- `*:up` scripts which just run pre-build images in containers
- `*:down` scripts which stop and remove the containers (along with data not stored in a volume!)

## Deploying to staging

To deploy to staging we use the same docker-compose files that are used in the docker setup above with a few minor tweaks to configure the stack for staging. The deployment uses Docker Swarm and sets up an OpenCRVS stack containing each service with a number of replicas defined in the docker compose files. **Note:** This deployment is currently automated so that every time we push to master the build will be deployed during the CI process.

The deploy is easily executed by just running: `yarn deploy:staging` - you will need ssh access to the server for this to work.

The applications will be available here:

- [Register app](https://register.opencrvs-staging.jembi.org/)
- [Login app](https://login.opencrvs-staging.jembi.org/)
- [GraphQl gateway](https://gateway.opencrvs-staging.jembi.org/)
- [Auth service](https://auth.opencrvs-staging.jembi.org/)

Some useful commands to manage the swarm:

- `ssh root@opencrvs-staging.jembi.org docker service ls` - see all services running in the swarm including how many replicas are running
- `ssh root@opencrvs-staging.jembi.org docker service logs -f <service-id>` - stream the logs for a particular service (which could include logs from multiple replicas)
- `ssh root@opencrvs-staging.jembi.org docker stack ps opencrvs` - view all tasks (containers) running in the opencrvs stack

To scale a service change the deploy->replicas setting in the corresponding compose file and run the deploy again.

## Deploying to QA

Deploying to QA is much the same as above, however you may specify a version to deploy. The version can be any docker image tag. Each time master is build on CI docker images are created for that commit hash. Any of these hashes may be used as the version. In addition any time a git tag is created and pushed all the docker images will automatically build. Once complete the name of this tag can be used to deploy to the QA environemt as well.

```
yarn deploy:qa VERSION
```

The applications will be available here:

- [Register app](https://register.opencrvs.qa1.jembi.org/)
- [Login app](https://login.opencrvs.qa1.jembi.org/)
- [GraphQl gateway](https://gateway.opencrvs.qa1.jembi.org/)
- [Auth service](https://auth.opencrvs.qa1.jembi.org/)

## Setting up a new cluster of servers for OpenCRVS

[See the documentation here](infrastructure/server-setup/README.md)

## Release branches

When doing releases that will require hotfixes we will create a new release branch off `master` with the naming format of `release/<name_of_release>`. E.g. `git checkout -b release/bn-demo`.

All hotfixes that are done for that release should be submitted in a PR against that release branch AS WELL AS submitted to the master branch in another PR if the code is relevent to master as well. Please comment in the PRs with the link to the other PR so that they may be tracked together. The reviewer should look at both and merge them in when they are happy.

## How to do a release

1. Update all packages with the new version number according to [semver](https://semver.org/). All packages will have the same version for simplicity as they are all designed to be used together. Update all dependencies to point to the newly created versions. E.g. `register` depend on `components`, so update the dependency: Do a find and replace for `1.0.0-alpha.2` and replace with `1.0.0-alpha.3`
2. Run `yarn` to ensure there are no version errors.
3. Run `yarn test` and ensure all passed.
4. Run `git tag v<version_number>` e.g. `git tag v1.0.0-alpha.1.0`
5. Run `git push origin v<version_number>`
6. Create a [new release on Github](https://github.com/jembi/OpenCRVS/releases) using the tag you just pushed and including any release notes.
7. Dockerhub should automatically build the images when a new release tag is created in Git. Howver Dockerhub can sometimes timeout and you may need to compose and push the release tagged images locally. To do that, run `yarn compose:push:release`
