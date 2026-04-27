ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/events/package.json /app/packages/events/package.json

WORKDIR /app/packages/events
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/events /app/packages/events
RUN yarn build:types

WORKDIR /app/packages/data-seeder
COPY --chown=node:node packages/data-seeder/*.json /app/packages/data-seeder/

RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/data-seeder /app/packages/data-seeder
ENTRYPOINT [ "sh", "-c", "yarn seed" ]
