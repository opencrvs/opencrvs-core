ARG  BRANCH=develop
ARG  BASE_IMAGE=ghcr.io/opencrvs/ocrvs-base
FROM ${BASE_IMAGE}:${BRANCH}

USER node

WORKDIR /app/packages/events
COPY --chown=node:node packages/events/*.json /app/packages/events/
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/events /app/packages/events
RUN yarn build

CMD [ "yarn", "start:prod" ]
