# This dockerfile only installs dependencies and build all packages
# It is used by each packages Dockerfile to copy out build artifacts
FROM node:erbium

# Make sure version variable is set
ARG VERSION
RUN test -n "$VERSION"

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# install dependencies first so they may be cached if there are no package.json changes
COPY package.json .
COPY yarn.lock .
COPY lerna.json .
COPY packages/auth/package.json packages/auth/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY packages/components/package.json packages/components/package.json
COPY packages/gateway/package.json packages/gateway/package.json
COPY packages/integration/package.json packages/integration/package.json
COPY packages/login/package.json packages/login/package.json
COPY packages/metrics/package.json packages/metrics/package.json
COPY packages/notification/package.json packages/notification/package.json
COPY packages/client/package.json packages/client/package.json
COPY packages/search/package.json packages/search/package.json
COPY packages/user-mgnt/package.json packages/user-mgnt/package.json
COPY packages/workflow/package.json packages/workflow/package.json
COPY packages/webhooks/package.json packages/webhooks/package.json
COPY patches patches
RUN yarn install

COPY . .
ENV VERSION "$VERSION"
ENV RESOURCES_URL "THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE"
ENV HOST "{{hostname}}"
RUN yarn build
