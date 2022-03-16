FROM node:erbium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/webhooks/tsconfig.json packages/webhooks/tsconfig.json
COPY packages/webhooks/package.json packages/webhooks/package.json
COPY packages/commons packages/commons
COPY yarn.lock yarn.lock
RUN yarn install --production

# Copy package build
COPY --from=opencrvs-build /packages/webhooks/build packages/webhooks/build

# Copy dependant package(s) source
COPY --from=opencrvs-build packages/commons packages/commons

EXPOSE 2525
WORKDIR /usr/src/app/packages/webhooks

CMD yarn start:prod
