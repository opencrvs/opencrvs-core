ARG  BRANCH=develop
FROM opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/metrics
COPY --chown=node:node packages/metrics /app/packages/metrics
RUN yarn install --frozen-lockfile && yarn build

CMD ["yarn", "start:prod"]