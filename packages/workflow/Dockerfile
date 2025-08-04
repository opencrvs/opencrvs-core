ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/workflow /app/packages/workflow

RUN pnpm fetch --filter ./packages/workflow... 
RUN pnpm install -r --offline --filter ./packages/workflow...

WORKDIR /app/packages/workflow
RUN pnpm build

CMD [ "pnpm", "start:prod" ]
