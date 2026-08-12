ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH} AS base

USER node

WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components
RUN pnpm install --frozen-lockfile && pnpm build

WORKDIR /app/packages/login
COPY --chown=node:node packages/login /app/packages/login
RUN pnpm install --frozen-lockfile && pnpm build


FROM nginxinc/nginx-unprivileged:1.29-alpine-otel

USER root
RUN sed -i '1iload_module modules/ngx_otel_module.so;' /etc/nginx/nginx.conf
USER nginx

ENV OTEL_NGINX_TRACE=off
ENV OTEL_NGINX_EXPORTER_ENDPOINT=127.0.0.1:4317
ENV OTEL_NGINX_SERVICE_NAME=opencrvs_login
ENV OTEL_NGINX_SERVICE_NAMESPACE=opencrvs
ENV OTEL_NGINX_DEPLOYMENT_ENVIRONMENT=production

COPY --from=base --chown=nginx:nginx /app/packages/login/build/ /usr/share/nginx/html/
COPY --chown=nginx:nginx packages/login/nginx.template.conf /etc/nginx/templates/default.conf.template
COPY --chown=nginx:nginx packages/login/logging.template.conf /etc/nginx/templates/logging.conf.template
EXPOSE 3020
