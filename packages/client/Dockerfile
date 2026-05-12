ARG BRANCH=develop
ARG PREVIOUS_IMAGE=nginxinc/nginx-unprivileged:1.28-alpine
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

COPY --chown=node:node packages/gateway /app/packages/gateway
COPY --chown=node:node packages/events /app/packages/events

WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components

RUN yarn install --frozen-lockfile  && yarn build

# Placeholders:
# Variables should be substituted in docker-compose/kubernetes manifest
ENV CONTENT_SECURITY_POLICY_WILDCARD="{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL_INTERNAL="{{COUNTRY_CONFIG_URL_INTERNAL}}"
ENV GATEWAY_URL_INTERNAL="{{GATEWAY_URL_INTERNAL}}"
WORKDIR /app/packages/client
COPY --chown=node:node packages/client /app/packages/client
RUN yarn install --frozen-lockfile && yarn build

FROM ${PREVIOUS_IMAGE} AS previous

FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY --from=0 --chown=nginx:nginx /app/packages/client/build/ /usr/share/nginx/html/
# Retain previous build's hashed assets so an old SW can still resolve stale chunk URLs
# during the upgrade transition window. New files take precedence (-n = no-clobber).
RUN --mount=from=previous,src=/usr/share/nginx/html,dst=/mnt/previous \
    sh -c 'cp -rn /mnt/previous/assets/. /usr/share/nginx/html/assets/ 2>/dev/null; chown -R nginx:nginx /usr/share/nginx/html/assets/'
COPY --chmod=555 packages/client/nginx-deploy-config.sh /docker-entrypoint.d/11-nginx-deploy-config.sh
COPY --chown=nginx:nginx packages/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
