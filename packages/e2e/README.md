<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [OpenCRVS integration / end to end tests](#opencrvs-integration--end-to-end-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# OpenCRVS integration / end to end tests

To run the e2e tests locally in the cypress app navigate to the `packages/e2e` folder and run:

```
yarn open
```

These test will automatically be run on travis-ci when you create a PR and will be run against our staging environment once once the code hits master and the staging environment has be auto-deployed.

These automatic tests run can be reviewed on the [Cypress OpenCRVS Dashboard](https://dashboard.cypress.io/#/projects/ayoz3q/runs).

These tests are meant for:
- Making sure integrations work as intended
- Verifying an environment works flawlessly, regardless if it's your local one, staging or production environment. Most valuable time to run these tests is probably right after deployment.
- Ensuring new PRs don't break existing functionality

These tests are not meant for:
- Verifying all possible scenarios work

Let's try and keep these tests as quick and slim as possible