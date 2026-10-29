ARG  BRANCH=develop
ARG  BASE_IMAGE=ghcr.io/opencrvs/ocrvs-base
FROM ${BASE_IMAGE}:${BRANCH}

USER node

# testland depends on the workspace @opencrvs/toolkit, whose declarations are
# emitted from the commons and events source (see tsconfig.toolkit-types.json).
COPY --chown=node:node packages/events/package.json /app/packages/events/package.json

WORKDIR /app/packages/events
RUN pnpm install --frozen-lockfile
COPY --chown=node:node packages/events /app/packages/events

COPY --chown=node:node packages/tsconfig.toolkit-types.json /app/packages/tsconfig.toolkit-types.json
COPY --chown=node:node packages/toolkit /app/packages/toolkit
WORKDIR /app/packages/toolkit
RUN pnpm install --frozen-lockfile
RUN pnpm build

COPY --chown=node:node packages/mosip /app/packages/mosip
WORKDIR /app/packages/mosip
RUN pnpm install --frozen-lockfile
RUN pnpm build

WORKDIR /app/packages/testland
COPY --chown=node:node packages/testland/*.json /app/packages/testland/

RUN pnpm install --frozen-lockfile
COPY --chown=node:node packages/testland /app/packages/testland

EXPOSE 3040

CMD [ "pnpm", "start:prod" ]
