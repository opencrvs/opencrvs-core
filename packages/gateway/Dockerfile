ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app

COPY --chown=node:node packages/events /app/packages/events
COPY --chown=node:node packages/gateway/*.json /app/packages/gateway/

RUN pnpm fetch --filter ./packages/gateway... --filter ./packages/events...
RUN pnpm install -r --offline --filter ./packages/gateway... --filter ./packages/events...

WORKDIR /app/packages/gateway
COPY --chown=node:node packages/gateway /app/packages/gateway
RUN pnpm build

CMD [ "pnpm", "start:prod" ]
