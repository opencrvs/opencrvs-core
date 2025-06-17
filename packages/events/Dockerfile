ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/events
COPY --chown=node:node packages/events/*.json /app/packages/events/
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY --chown=node:node packages/events /app/packages/events
RUN yarn build

CMD [ "yarn", "start:prod" ]