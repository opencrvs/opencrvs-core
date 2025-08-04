ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/user-mgnt /app/packages/user-mgnt

RUN pnpm fetch --filter ./packages/user-mgnt... 
RUN pnpm install -r --offline --filter ./packages/user-mgnt...

WORKDIR /app/packages/user-mgnt
RUN pnpm build

CMD ["pnpm", "start:prod"]
