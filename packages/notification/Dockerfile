FROM node:dubnium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/notification/package.json packages/notification/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY yarn.lock yarn.lock
RUN yarn install

# Copy package source
COPY packages/notification packages/notification

# Copy dependant package(s) source
COPY packages/commons packages/commons

# set environment
ENV PORT=2020
ENV HOST=0.0.0.0
# TODO change this for production
ENV NODE_ENV=DEVELOPMENT

EXPOSE 2020
WORKDIR /usr/src/app/packages/notification

CMD yarn start:prod
