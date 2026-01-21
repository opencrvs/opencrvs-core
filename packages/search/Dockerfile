ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app

COPY --chown=node:node packages/search /app/packages/search

RUN pnpm fetch --filter ./packages/search... 
RUN pnpm install -r --offline --filter ./packages/search...

WORKDIR /app/packages/search
RUN pnpm build


CMD [ "pnpm", "start:prod" ]

