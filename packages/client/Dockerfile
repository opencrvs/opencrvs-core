ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH} AS base

USER node

COPY --chown=node:node packages/gateway /app/packages/gateway
COPY --chown=node:node packages/events /app/packages/events

WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components

RUN yarn install --frozen-lockfile  && yarn build

WORKDIR /app/packages/client
COPY --chown=node:node packages/client /app/packages/client
RUN yarn install --frozen-lockfile && yarn build

FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY --from=base --chown=nginx:nginx /app/packages/client/build/ /usr/share/nginx/html/
COPY --chown=nginx:nginx packages/client/nginx.template.conf /etc/nginx/templates/default.conf.template
COPY --chown=nginx:nginx packages/client/logging.template.conf /etc/nginx/templates/logging.conf.template

EXPOSE 3000
