ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/events/package.json /app/packages/events/package.json

WORKDIR /app/packages/events
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/events /app/packages/events
RUN yarn build:types

WORKDIR /app/packages/user-mgnt
COPY --chown=node:node packages/user-mgnt /app/packages/user-mgnt
RUN yarn install --frozen-lockfile && yarn build

CMD ["yarn", "start:prod"]
