ARG  VERSION=dev
FROM opencrvs/ocrvs-base:${VERSION}

USER node

WORKDIR /app/packages/auth
COPY --chown=node:node packages/auth/*.json /app/packages/auth/
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/auth /app/packages/auth
RUN yarn build

CMD ["yarn", "start:prod"]
