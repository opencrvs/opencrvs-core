ARG  BRANCH=develop
ARG  BASE_IMAGE=ghcr.io/opencrvs/ocrvs-base
FROM ${BASE_IMAGE}:${BRANCH}

USER node

WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components
RUN yarn install --frozen-lockfile && yarn build

WORKDIR /app/packages/login
COPY --chown=node:node packages/login /app/packages/login
RUN yarn install --frozen-lockfile && yarn build


FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY --from=base --chown=nginx:nginx /app/packages/login/build/ /usr/share/nginx/html/
COPY --chown=nginx:nginx packages/login/nginx.template.conf /etc/nginx/templates/default.conf.template
COPY --chown=nginx:nginx packages/login/logging.template.conf /etc/nginx/templates/logging.conf.template
USER nginx
EXPOSE 3020
