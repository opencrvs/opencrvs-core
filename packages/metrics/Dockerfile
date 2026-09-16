ARG  BRANCH=develop
ARG  BASE_IMAGE=ghcr.io/opencrvs/ocrvs-base
FROM ${BASE_IMAGE}:${BRANCH}

USER node

WORKDIR /app/packages/metrics
COPY --chown=node:node packages/metrics /app/packages/metrics
RUN yarn install --frozen-lockfile && yarn build

CMD ["yarn", "start:prod"]