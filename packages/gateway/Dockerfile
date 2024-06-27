ARG  VERSION=dev
FROM opencrvs/ocrvs-base:${VERSION}

USER node

WORKDIR /app/packages/gateway
COPY --chown=node:node packages/gateway/*.json /app/packages/gateway/
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/gateway /app/packages/gateway
RUN yarn build

CMD [ "yarn", "start:prod" ]
