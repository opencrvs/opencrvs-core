ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/auth
COPY --chown=node:node packages/auth/*.json /app/packages/auth/
RUN pnpm install --frozen-lockfile
COPY --chown=node:node packages/auth /app/packages/auth
RUN pnpm build

CMD ["pnpm", "start:prod"]
