/*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration 
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS 
graphic logo are (registered/a) trademark(s) of Plan International.
*/
FROM node:dubnium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /usr/src/app/packages/resources/src/bgd/packages/bgd-dhis2-mediator
COPY packages/resources/src/bgd/packages/bgd-dhis2-mediator/package.json package.json
COPY packages/resources/src/bgd/packages/bgd-dhis2-mediator/yarn.lock yarn.lock
RUN yarn install

# Copy package source
COPY packages/resources/src/bgd/packages/bgd-dhis2-mediator /usr/src/app/packages/resources/src/bgd/packages/bgd-dhis2-mediator
RUN yarn build

EXPOSE 8040

# TODO wait for openhim api
CMD yarn start:prod
