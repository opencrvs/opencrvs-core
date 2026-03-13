ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/events/package.json /app/packages/events/package.json

WORKDIR /app/packages/events
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/events /app/packages/events
RUN yarn build:types

WORKDIR /app/packages/auth
COPY --chown=node:node packages/auth/*.json /app/packages/auth/
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/auth /app/packages/auth
RUN yarn build

CMD ["yarn", "start:prod"]
