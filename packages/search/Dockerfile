ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/search
COPY --chown=node:node packages/search /app/packages/search
RUN pnpm install --frozen-lockfile && pnpm build


CMD [ "pnpm", "start:prod" ]

