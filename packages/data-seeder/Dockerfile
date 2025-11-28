ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/data-seeder/*.json /app/packages/data-seeder/

RUN pnpm fetch --filter ./packages/data-seeder... 
RUN pnpm install -r --offline --filter ./packages/data-seeder...

COPY --chown=node:node packages/data-seeder /app/packages/data-seeder

ENTRYPOINT [ "sh", "-c", "pnpm seed:prod" ]