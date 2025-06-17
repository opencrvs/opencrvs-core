ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/search
COPY --chown=node:node packages/search /app/packages/search
RUN yarn install --frozen-lockfile --network-timeout 600000 && yarn build


CMD [ "yarn", "start:prod" ]

