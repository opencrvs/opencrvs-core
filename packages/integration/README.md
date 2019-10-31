<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [Integration and performance tests](#integration-and-performance-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Integration and performance tests

To run the tests make sure you have the application running locally then, execute `yarn start` in this folder. If on **OSX** or if you get an error, you may need to provide you IP address in `src/constants.ts` instead of `172.17.0.1` (which is the default docker gateway).

Script are also provide to run against staging and qa using `yarn start:staging` and `yarn start:qa`

These script can also be used to insert a large amount of data into our test environments.
