FROM node:dubnium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn
ENV CHECK_INVALID_TOKEN true

WORKDIR /usr/src/app/packages/resources/src/bgd/mediators/bgd-dhis2
COPY packages/resources/src/bgd/mediators/bgd-dhis2/package.json package.json
COPY packages/resources/src/bgd/mediators/bgd-dhis2/yarn.lock yarn.lock
RUN yarn install

# Copy package source
COPY packages/resources/src/bgd/mediators/bgd-dhis2 /usr/src/app/packages/resources/src/bgd/mediators/bgd-dhis2
RUN yarn build

EXPOSE 8040

# TODO wait for openhim api
CMD yarn start:prod
