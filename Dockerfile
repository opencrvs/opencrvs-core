# This dockerfile only installs dependencies and build all packages
# It is used by each packages Dockerfile to copy out build artifacts
FROM node:16.20.0

# Make sure version variable is set
ARG VERSION
RUN test -n "$VERSION"

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn


# install dependencies first so they may be cached if there are no package.json changes

COPY package.json .
COPY yarn.lock .
COPY lerna.json .
#COPY packages/auth/package.json packages/auth/package.json
COPY packages/commons packages/commons
COPY packages/components packages/components
#OPY packages/gateway/package.json packages/gateway/package.json
#OPY packages/login/package.json packages/login/package.json
#OPY packages/metrics/package.json packages/metrics/package.json
#OPY packages/config/package.json packages/config/package.json
#OPY packages/notification/package.json packages/notification/package.json
#OPY packages/client/package.json packages/client/package.json
#OPY packages/search/package.json packages/search/package.json
#OPY packages/user-mgnt/package.json packages/user-mgnt/package.json
#OPY packages/workflow/package.json packages/workflow/package.json
#OPY packages/webhooks/package.json packages/webhooks/package.json
#OPY packages/documents/package.json packages/documents/package.json
COPY patches patches
RUN yarn install

COPY . .
ENV VERSION "$VERSION"
ENV COUNTRY_CONFIG_URL "THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE"
ENV HOST "{{hostname}}"
RUN yarn build
