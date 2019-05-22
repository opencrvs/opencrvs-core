FROM node:dubnium
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/metrics/package.json packages/metrics/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY yarn.lock yarn.lock
RUN yarn install

# Copy package source
COPY packages/metrics packages/metrics

# Copy dependant package(s) source
COPY packages/commons packages/commons

# set environment
ENV PORT=1050
# TODO change this for production
ENV NODE_ENV=DEVELOPMENT

EXPOSE 1050
WORKDIR /usr/src/app/packages/metrics

CMD yarn start:prod
