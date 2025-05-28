ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/events
COPY --chown=node:node packages/events/*.json /app/packages/events/

# use NODE_ENV production to not install dev dependencies
RUN NODE_ENV=production yarn install --frozen-lockfile

COPY --chown=node:node packages/events /app/packages/events
RUN yarn build

CMD [ "yarn", "start:prod" ]
