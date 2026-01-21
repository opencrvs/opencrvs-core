ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node
WORKDIR /app

# Placeholders:
# Variables should be substituted in docker-compose/kubernetes manifest
ENV CONTENT_SECURITY_POLICY_WILDCARD="{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL_INTERNAL="{{COUNTRY_CONFIG_URL_INTERNAL}}"

COPY --chown=node:node packages/components /app/packages/components
COPY --chown=node:node packages/login /app/packages/login

RUN pnpm fetch --filter ./packages/components...
RUN pnpm install -r --offline --filter ./packages/components...

WORKDIR /app/packages/components
RUN pnpm build

WORKDIR /app

RUN pnpm fetch --filter ./packages/login... 
RUN pnpm install -r --offline --filter ./packages/login... 
WORKDIR /app/packages/login
RUN pnpm build

# Step 2. Build the actual image
FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY --from=0 --chown=nginx:nginx /app/packages/login/build/ /usr/share/nginx/html/

COPY --chmod=555 packages/login/nginx-deploy-config.sh /docker-entrypoint.d/11-nginx-deploy-config.sh
COPY --chown=nginx:nginx packages/login/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3020
