ARG  VERSION=dev
FROM opencrvs/ocrvs-base:${VERSION}

USER node

# Copy packages
WORKDIR /app/packages/components
COPY --chown=node:node packages/components /app/packages/components
RUN yarn install --frozen-lockfile 
RUN yarn build-storybook


# Step 2. Build the actual image

FROM nginx:1.25

RUN apt-get update && apt-get upgrade -y

ARG HOST
ARG COUNTRY_CONFIG_URL
ENV HOST=$HOST
ENV COUNTRY_CONFIG_URL=$COUNTRY_CONFIG_URL

COPY --from=0 /app/packages/components/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
