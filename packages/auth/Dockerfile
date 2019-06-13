FROM node:dubnium as builder
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY . .
RUN yarn install && cd packages/auth && yarn build

FROM node:dubnium-alpine
WORKDIR /usr/src/app

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/auth/package.json packages/auth/package.json
COPY yarn.lock yarn.lock
RUN yarn install --production

# Copy package build
COPY --from=builder /usr/src/app/packages/auth/build packages/auth/build

# set environment
ENV AUTH_PORT=4040
ENV AUTH_HOST=0.0.0.0
# TODO change this for production
ENV NODE_ENV=DEVELOPMENT

EXPOSE 4040
WORKDIR /usr/src/app/packages/auth

CMD yarn start:prod
