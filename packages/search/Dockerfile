ARG  BRANCH=develop
FROM opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/search
COPY --chown=node:node packages/search /app/packages/search
RUN yarn install --frozen-lockfile && yarn build


CMD [ "yarn", "start:prod" ]

