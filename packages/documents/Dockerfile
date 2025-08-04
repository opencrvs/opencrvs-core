ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app

COPY --chown=node:node packages/documents/*.json /app/packages/documents/
RUN pnpm fetch --filter ./packages/documents... 
RUN pnpm install -r --offline --filter ./packages/documents...

WORKDIR /app/packages/documents
COPY --chown=node:node packages/documents /app/packages/documents
RUN pnpm build

CMD [ "pnpm", "start:prod" ]