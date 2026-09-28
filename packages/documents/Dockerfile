ARG  BRANCH=develop
ARG  BASE_IMAGE=ghcr.io/opencrvs/ocrvs-base
FROM ${BASE_IMAGE}:${BRANCH}

USER node

WORKDIR /app/packages/documents
COPY --chown=node:node packages/documents/*.json /app/packages/documents/
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/documents /app/packages/documents
RUN yarn build

CMD [ "yarn", "start:prod" ]