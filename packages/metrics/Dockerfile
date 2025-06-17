ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/metrics
COPY --chown=node:node packages/metrics /app/packages/metrics
RUN yarn install --frozen-lockfile --network-timeout 600000 && yarn build

CMD ["yarn", "start:prod"]