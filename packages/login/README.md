<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [OpenCRVS Login client](#opencrvs-login-client)
  - [How do I log in during development?](#how-do-i-log-in-during-development)
  - [Where do I get the SMS verification code in development and production?](#where-do-i-get-the-sms-verification-code-in-development-and-production)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# OpenCRVS Login client

This is the OpenCRVS 2-Factor Authenticated login client application.

Built in Typescript and bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) & the [Craco](https://github.com/gsoft-inc/craco) CRA configuration package.

For information on how to configure the login client, refer to the "resources" package config for your country implementation

### How do I log in during development?

- Make sure you have the development environment running
- Open http://localhost:3020
- By default the user database has no entries. Go to `resources` project and run populate scripts for your country.

### Where do I get the SMS verification code in development and production?

By default SMS 2-Factor-Auth is disabled in development and QA. It will always be "000000".

When 2FA is enabled in production, check the docker logs where you're running Auth API.
You should see something like this there after you've finished the first login step:

```
@opencrvs/auth: info: Sending a verification SMS {"mobile":"+447111111111","verificationCode":"000000"}
```
