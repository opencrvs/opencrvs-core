ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/notification
COPY --chown=node:node packages/notification /app/packages/notification
RUN pnpm install --frozen-lockfile && pnpm build

CMD [ "pnpm", "start:prod" ]
