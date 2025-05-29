<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents**

- [OpenCRVS Authentication service](#opencrvs-authentication-service)
  - [Dev guide](#dev-guide)
  - [Generating new tokens for tests](#generating-new-tokens-for-tests)
  - [Configuration Props](#configuration-props)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# OpenCRVS Authentication service

A microservice to manage authentication concerns such as user sessions, token generation and and 2 factor auth.

## Dev guide

Start the service with `pnpm start`

Watch the tests with `pnpm test:watch`

When in dev mode swagger API docs are available at `http://localhost:4040/documentation`

## Generating new tokens for tests

`pnpm generate-test-token <user id> <role> <expiry delta from now>`

## Configuration Props

The following environment variables have been added, in order to provide configuration on the auth token expiry times

Sets the number of seconds that the client JWT will be valid for

`CONFIG_TOKEN_EXPIRY_SECONDS`

Sets the number of seconds that the 2-factor SMS code will be valid for

`CONFIG_SMS_CODE_EXPIRY_SECONDS`
