ARG  VERSION=dev
FROM opencrvs/ocrvs-base:${VERSION}

USER node

WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components
RUN yarn install --frozen-lockfile  && yarn build
ENV CONTENT_SECURITY_POLICY_WILDCARD "{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL "THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE"

WORKDIR /app/packages/client
COPY --chown=node:node packages/client /app/packages/client
RUN yarn install --frozen-lockfile && yarn build

FROM nginx:1.25
RUN apt-get update && apt-get upgrade -y

COPY --from=0 /app/packages/client/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
