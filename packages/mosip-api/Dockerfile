ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

# mosip-api depends on the workspace @opencrvs/toolkit, which in turn needs
# @opencrvs/events build types (commons is already built in ocrvs-base).
COPY --chown=node:node packages/events/package.json /app/packages/events/package.json

WORKDIR /app/packages/events
RUN pnpm install --frozen-lockfile
COPY --chown=node:node packages/events /app/packages/events
RUN pnpm build:types

COPY --chown=node:node packages/toolkit /app/packages/toolkit
WORKDIR /app/packages/toolkit
RUN pnpm install --frozen-lockfile
RUN pnpm build

# @opencrvs/mosip is a workspace dependency of mosip-api and is consumed through
# its build/ output, so it has to be compiled before the service starts.
COPY --chown=node:node packages/mosip /app/packages/mosip
WORKDIR /app/packages/mosip
RUN pnpm install --frozen-lockfile
RUN pnpm build

WORKDIR /app/packages/mosip-api
COPY --chown=node:node packages/mosip-api/*.json /app/packages/mosip-api/

RUN pnpm install --frozen-lockfile
COPY --chown=node:node packages/mosip-api /app/packages/mosip-api

EXPOSE 2024

CMD [ "pnpm", "start:prod" ]
