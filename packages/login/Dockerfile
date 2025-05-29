ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

ENV CONTENT_SECURITY_POLICY_WILDCARD "{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL_INTERNAL "{{COUNTRY_CONFIG_URL_INTERNAL}}"

WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components
RUN pnpm install --frozen-lockfile && pnpm build

WORKDIR /app/packages/login
COPY --chown=node:node packages/login /app/packages/login
RUN pnpm install --frozen-lockfile && pnpm build

# Step 2. Build the actual image

FROM nginx:1.27

RUN apt-get update && apt-get upgrade -y

COPY --from=0 /app/packages/login/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY packages/login/nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
