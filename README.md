# OpenCRVS

This repo contains the frontend components and frontend related middleware for the OpenCRVS app.

## Development environment setup

1. Clone the repo
2. Run `yarn` to install deps
3. Run `yarn dev` to up the dev environment (frontend will autoreload and backend services are started via docker-compose)

Optional: full backend setup

4. Log into the OpenHIM at [here](http://localhost:8888) to load one initial config - default password is root@openhim.org:openhim-password (login will fail a security check as we are using self signed certs by default, follow the instructions in the error message)
5. One logged in click Export/Import then drop the file `infrastructure/openhim-base-config.json` into the import box and click 'Import'
6. Test the setup with `curl http://localhost:5001/fhir/Patient/123` you should get some JSON with a 'Not found' error.
