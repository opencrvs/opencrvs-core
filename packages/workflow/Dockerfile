ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/workflow
COPY --chown=node:node packages/workflow /app/packages/workflow
RUN yarn install --frozen-lockfile --network-timeout 600000 && yarn build

CMD [ "yarn", "start:prod" ]
