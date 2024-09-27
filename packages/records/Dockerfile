ARG  BRANCH=develop
FROM opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/records
COPY --chown=node:node packages/records/*.json /app/packages/records/
RUN yarn install --frozen-lockfile
COPY --chown=node:node packages/records /app/packages/records
RUN yarn build

CMD [ "yarn", "start:prod" ]