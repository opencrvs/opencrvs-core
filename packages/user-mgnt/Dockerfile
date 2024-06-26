ARG  VERSION=dev
FROM opencrvs/ocrvs-base:${VERSION}

USER node

WORKDIR /app/packages/user-mgnt
COPY --chown=node:node packages/user-mgnt /app/packages/user-mgnt
RUN yarn install --frozen-lockfile && yarn build

CMD ["yarn", "start:prod"]
