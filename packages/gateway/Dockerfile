ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/events /app/packages/events

WORKDIR /app/packages/gateway
COPY --chown=node:node packages/gateway/*.json /app/packages/gateway/

RUN yarn install --frozen-lockfile --network-timeout 600000
COPY --chown=node:node packages/gateway /app/packages/gateway
RUN yarn build

CMD [ "yarn", "start:prod" ]
