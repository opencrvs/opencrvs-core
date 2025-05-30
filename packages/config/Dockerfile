ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/config
COPY --chown=node:node packages/config/*.json /app/packages/config/
RUN pnpm install --frozen-lockfile
COPY --chown=node:node packages/config /app/packages/config
RUN pnpm build

CMD [ "pnpm", "start" ]
