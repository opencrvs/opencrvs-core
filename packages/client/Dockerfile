ARG  BRANCH=develop
FROM opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/components
COPY --chown=node:node components /app/packages/components
RUN yarn install --frozen-lockfile  && yarn build
ENV CONTENT_SECURITY_POLICY_WILDCARD "{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL "THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE"

WORKDIR /app/packages/client
COPY --chown=node:node client /app/packages/client
RUN yarn install --frozen-lockfile && yarn build

FROM nginx:1.27
RUN apt-get update && apt-get upgrade -y

COPY client/nginx/nginx-deploy-config.sh /
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod +x /nginx-deploy-config.sh

COPY --from=0 /app/packages/client/build/ /usr/share/nginx/html/

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
