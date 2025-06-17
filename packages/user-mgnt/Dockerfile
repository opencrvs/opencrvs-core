ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/user-mgnt
COPY --chown=node:node packages/user-mgnt /app/packages/user-mgnt
RUN yarn install --frozen-lockfile --network-timeout 600000 && yarn build

CMD ["yarn", "start:prod"]
