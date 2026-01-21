ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/events/*.json /app/packages/events/
RUN pnpm fetch --filter ./packages/events... 
RUN pnpm install -r --offline --filter ./packages/events...

WORKDIR /app/packages/events
COPY --chown=node:node packages/events /app/packages/events
RUN pnpm build

CMD [ "pnpm", "start:prod" ]
