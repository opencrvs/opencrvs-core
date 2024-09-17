ARG  BRANCH=develop
FROM opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/gateway
COPY --chown=node:node *.json /app/packages/gateway/
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
RUN yarn build

RUN ls -lha /app/packages/gateway/build/dist/src
RUN ls -lha /app/packages/gateway/build/dist/src/graphql

CMD [ "yarn", "start:prod" ]
