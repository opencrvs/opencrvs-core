ARG  VERSION=dev
FROM opencrvs/ocrvs-base:${VERSION}

USER node

## Add the wait script to the image
ADD --chown=node:node https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /app/wait
RUN chmod +x /app/wait

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /app/packages/migration

COPY --chown=node:node packages/migration /app/packages/migration

RUN yarn install --frozen-lockfile
RUN yarn build

WORKDIR /app/packages/migration

CMD ["/app/wait", "&&", "yarn start:prod"]
