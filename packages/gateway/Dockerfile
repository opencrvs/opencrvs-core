ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/events /app/packages/events

WORKDIR /app

COPY --chown=node:node packages/gateway/*.json /app/packages/gateway/
RUN pnpm fetch --filter ./packages/gateway... 
RUN pnpm install -r --offline --filter ./packages/gateway...

WORKDIR /app/packages/gateway
COPY --chown=node:node packages/gateway /app/packages/gateway
RUN pnpm build

CMD [ "pnpm", "start:prod" ]
