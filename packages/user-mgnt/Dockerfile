FROM node:dubnium
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/user-mgnt/package.json packages/user-mgnt/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY yarn.lock yarn.lock
RUN yarn install

# Copy package source
COPY packages/user-mgnt packages/user-mgnt

# Copy dependant package(s) source
COPY packages/commons packages/commons

# set environment
ENV PORT=3030
ENV HOST=0.0.0.0
# TODO change this for production
ENV NODE_ENV=DEVELOPMENT

EXPOSE 3030
WORKDIR /usr/src/app/packages/user-mgnt

CMD yarn start:prod
