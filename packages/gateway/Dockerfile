FROM node:dubnium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY . .
RUN yarn install
RUN cd packages/gateway && yarn build

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/gateway/package.json packages/gateway/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY yarn.lock yarn.lock
RUN yarn install --production

# Copy package buid
COPY --from=builder /usr/src/app/packages/gateway packages/gateway

# Copy dependant package(s) source
COPY packages/commons packages/commons

# set environment
ENV PORT=7070
# TODO change this for production
ENV NODE_ENV=DEVELOPMENT
ENV LOG_LEVEL=30
ENV APP_NAME=OPENCRVS_API_GATEWAY

EXPOSE 7070
WORKDIR /usr/src/app/packages/gateway

CMD yarn start:prod
