FROM node:erbium-alpine

# this package has dependencies (iconv) that require build tools
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual build-dependencies add python make g++

WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/notification/package.json packages/notification/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY yarn.lock yarn.lock
RUN yarn install --production

RUN apk del build-dependencies

# Copy package build
COPY --from=opencrvs-build packages/notification/build packages/notification/build

# Copy dependant package(s) source
COPY --from=opencrvs-build packages/commons packages/commons

EXPOSE 2020
WORKDIR /usr/src/app/packages/notification

CMD yarn start:prod
