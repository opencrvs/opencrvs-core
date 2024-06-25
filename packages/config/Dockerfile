ARG  VERSION=dev
FROM opencrvs/ocrvs-base:${VERSION}

USER node

WORKDIR /app/packages/config
COPY --chown=node:node packages/config/*.json /app/packages/config/
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/config /app/packages/config
RUN yarn build

CMD [ "yarn", "start" ]
