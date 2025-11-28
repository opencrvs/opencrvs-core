ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/auth/*.json /app/packages/auth/

RUN pnpm fetch --filter ./packages/auth... 
RUN pnpm install -r --offline --filter ./packages/auth... 

WORKDIR /app/packages/auth
COPY --chown=node:node packages/auth /app/packages/auth
RUN pnpm build

CMD ["pnpm", "start:prod"]
