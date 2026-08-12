# e2e testing

### Run against localhost

`yarn e2e-dev`

### Run against a deployed environment

`NODE_TLS_REJECT_UNAUTHORIZED=0 DOMAIN=<your-env>.opencrvs.dev yarn e2e`

## How to write a test

[See how to write a test that is not flaky](./HOW-TO-WRITE-A-TEST.md)

## How to debug E2E tests on CI

1. Go to E2E repository https://github.com/opencrvs/e2e
2. Find the `Deploy & run E2E` action run that failed
3. Locate the failing test(s)
4. Under `upload-artifact` step, download the artifact
5. Unzip the downloaded artifact

   ### CLI approach

   6. run `npx playwright show-report path-to-unzipped-report` and open the link (`Serving HTML report at http://localhost:9323.`)
   7. Select the failing test
   8. Detailed view of the case is opened
   9. Further down, you see screenshots taken during the failure and trace.
   10. Click `trace` thubmnail

   ### Click through UI approach

   6. Open the `index.html` file in browser
   7. Select the failing test
   8. Detailed view of the case is opened
   9. Further down, you see screenshots taken during the failure and trace.
   10. Download `trace`
   11. Open browser, go to https://trace.playwright.dev
   12. Open the previously downloaded trace .zip

You are now able to debug the failed test case as it would have happened on your local environment

![alt text](e2e-debug-steps.png 'E2E debug steps')
