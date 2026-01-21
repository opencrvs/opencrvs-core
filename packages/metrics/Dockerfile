ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app
COPY --chown=node:node packages/metrics /app/packages/metrics

RUN pnpm fetch --filter ./packages/metrics...
RUN pnpm install -r --offline --filter ./packages/metrics...

WORKDIR /app/packages/metrics
RUN pnpm build

CMD ["pnpm", "start:prod"]