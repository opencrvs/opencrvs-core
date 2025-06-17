ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/webhooks
COPY --chown=node:node packages/webhooks /app/packages/webhooks
RUN yarn install --frozen-lockfile --network-timeout 600000 && yarn build

CMD [ "yarn", "start:prod" ]
