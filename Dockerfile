# This dockerfile only installs dependencies and build all packages
# It is used by each packages Dockerfile to copy out build artifacts

FROM node:dubnium

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# install dependencies first so they may be cached if there are no package.json changes
COPY package.json .
COPY yarn.lock .
COPY lerna.json .
COPY packages/auth/package.json packages/auth/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY packages/components/package.json packages/components/package.json
COPY packages/e2e/package.json packages/e2e/package.json
COPY packages/gateway/package.json packages/gateway/package.json
COPY packages/integration/package.json packages/integration/package.json
COPY packages/login/package.json packages/login/package.json
COPY packages/metrics/package.json packages/metrics/package.json
COPY packages/notification/package.json packages/notification/package.json
COPY packages/performance/package.json packages/performance/package.json
COPY packages/register/package.json packages/register/package.json
COPY packages/resources/package.json packages/resources/package.json
COPY packages/search/package.json packages/search/package.json
COPY packages/user-mgnt/package.json packages/user-mgnt/package.json
COPY packages/workflow/package.json packages/workflow/package.json
COPY patches patches
RUN yarn install

COPY . .
RUN yarn build
