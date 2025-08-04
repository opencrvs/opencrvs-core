ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node
WORKDIR /app

COPY --chown=node:node packages/gateway /app/packages/gateway
COPY --chown=node:node packages/events /app/packages/events
COPY --chown=node:node packages/components /app/packages/components
COPY --chown=node:node packages/client /app/packages/client

RUN pnpm fetch --filter ./packages/components...
RUN pnpm install -r --offline --filter ./packages/components...

WORKDIR /app/packages/components
RUN pnpm build

WORKDIR /app

RUN pnpm fetch --filter ./packages/client... 
RUN pnpm install -r --offline --filter ./packages/client... 

# Placeholders:
# Variables should be substituted in docker-compose/kubernetes manifest
ENV CONTENT_SECURITY_POLICY_WILDCARD="{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL_INTERNAL="{{COUNTRY_CONFIG_URL_INTERNAL}}"
ENV GATEWAY_URL_INTERNAL="{{GATEWAY_URL_INTERNAL}}"

WORKDIR /app/packages/client
RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY --from=0 --chown=nginx:nginx /app/packages/client/build/ /usr/share/nginx/html/

COPY --chmod=555 packages/client/nginx-deploy-config.sh /docker-entrypoint.d/11-nginx-deploy-config.sh
COPY --chown=nginx:nginx packages/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
