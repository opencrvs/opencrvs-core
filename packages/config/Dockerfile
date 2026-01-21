ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/config/*.json /app/packages/config/
RUN pnpm fetch --filter ./packages/config... 
RUN pnpm install -r --offline --filter ./packages/config...

WORKDIR /app/packages/config
COPY --chown=node:node packages/config /app/packages/config
RUN pnpm build

CMD [ "pnpm", "start" ]
