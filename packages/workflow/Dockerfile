ARG  BRANCH=develop
ARG  BASE_IMAGE=ghcr.io/opencrvs/ocrvs-base
FROM ${BASE_IMAGE}:${BRANCH}

USER node

WORKDIR /app/packages/workflow
COPY --chown=node:node packages/workflow /app/packages/workflow
RUN yarn install --frozen-lockfile && yarn build

CMD [ "yarn", "start:prod" ]
