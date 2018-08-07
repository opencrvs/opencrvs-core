# OpenCRVS Authentication service

A microservice to manage authentication concerns such as user sessions, token generation and and 2 factor auth.

## Dev guide

Start the service with `yarn start`

Watch the tests with `yarn test:watch`

When in dev mode swagger API docs are available at `http://localhost:4040/documentation`

## Generating new tokens for tests

`yarn generate-test-token <user id> <role> <expiry delta from now>`

## Configuration Props

The following environment variables have been added, in order to provide configuration on the auth token expiry times

Sets the number of seconds that the client JWT will be valid for

`CONFIG_TOKEN_EXPIRY_SECONDS`

Sets the number of seconds that the 2-factor SMS code will be valid for

`CONFIG_SMS_CODE_EXPIRY_SECONDS`
