ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/testland
COPY --chown=node:node packages/testland/*.json /app/packages/testland/

RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/testland /app/packages/testland

EXPOSE 3040

CMD [ "yarn", "start:prod" ]
