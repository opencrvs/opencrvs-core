ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/workflow
COPY --chown=node:node packages/workflow /app/packages/workflow
RUN pnpm install --frozen-lockfile && pnpm build

CMD [ "pnpm", "start:prod" ]
