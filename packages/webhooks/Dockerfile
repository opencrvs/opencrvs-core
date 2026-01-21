ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/webhooks /app/packages/webhooks

RUN pnpm fetch --filter ./packages/webhooks... 
RUN pnpm install -r --offline --filter ./packages/webhooks...

WORKDIR /app/packages/webhooks
RUN pnpm build

CMD [ "pnpm", "start:prod" ]
