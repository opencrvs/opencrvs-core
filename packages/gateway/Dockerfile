ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/events /app/packages/events

WORKDIR /app/packages/gateway
COPY --chown=node:node *.json /app/packages/gateway/
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
RUN yarn build

CMD [ "yarn", "start:prod" ]
