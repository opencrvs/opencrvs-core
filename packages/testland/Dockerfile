ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

# testland depends on the workspace @opencrvs/toolkit, which in turn needs
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
