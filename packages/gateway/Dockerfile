ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/events/package.json /app/packages/events/package.json

WORKDIR /app/packages/events
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/events /app/packages/events
RUN yarn build:types

WORKDIR /app/packages/gateway
COPY --chown=node:node packages/gateway/*.json /app/packages/gateway/

RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/gateway /app/packages/gateway
RUN yarn build

CMD [ "yarn", "start:prod" ]
