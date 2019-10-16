# Bangaldesh DHIS2 integration mediator

A mediator to adapt messages that DHIS2 will send us into our FHIR API format.

## Production deployment

To deploy to production the following docker secrets will need to be available on the swarm (this is also covered in the server setup docs):

```sh
# For BGD DHIS2 medaitor, for API access to the OpenHIM
printf "<openhim-user>" | docker secret create openhim-user -
printf "<openhim-password>" | docker secret create openhim-password -
```

In addition an API user will need to be created. This is a user with the API_USER role and type. This can be done through the user management page in the app. The details of this API user must be shared with the integration partner to use to authenticate with OpenCRVS.

## Dev guide

Start the service with `yarn start`

Watch the tests with `yarn test:watch`

When in dev mode swagger API docs are available at `http://localhost:8040/documentation`
