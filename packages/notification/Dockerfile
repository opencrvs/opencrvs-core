ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app

COPY --chown=node:node packages/notification /app/packages/notification

RUN pnpm fetch --filter ./packages/notification... 
RUN pnpm install -r --offline --filter ./packages/notification...

WORKDIR /app/packages/notification
RUN pnpm build

CMD [ "pnpm", "start:prod" ]
