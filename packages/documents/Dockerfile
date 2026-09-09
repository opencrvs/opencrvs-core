ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/documents
COPY --chown=node:node packages/documents/*.json /app/packages/documents/
RUN pnpm install --frozen-lockfile
COPY --chown=node:node packages/documents /app/packages/documents
RUN pnpm build

CMD [ "pnpm", "start:prod" ]