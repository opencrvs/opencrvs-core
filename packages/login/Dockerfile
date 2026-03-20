ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH} AS base

USER node

WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components
RUN yarn install --frozen-lockfile && yarn build

WORKDIR /app/packages/login
COPY --chown=node:node packages/login /app/packages/login
RUN yarn install --frozen-lockfile && yarn build


FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY --from=base --chown=nginx:nginx /app/packages/login/build/ /usr/share/nginx/html/
COPY --chmod=555 packages/login/nginx-deploy-config.sh /docker-entrypoint.d/11-nginx-deploy-config.sh
COPY --chown=nginx:nginx packages/login/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3020
