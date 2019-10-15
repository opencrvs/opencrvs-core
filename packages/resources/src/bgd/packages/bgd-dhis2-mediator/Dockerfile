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
