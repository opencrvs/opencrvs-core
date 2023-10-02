# Step 1. Build the javascript bundle

FROM node:gallium-alpine
WORKDIR /app

COPY . .

# Remove packages we don't need to speed up yarn install
RUN rm -rf /app/packages/*

# Copy packages
COPY packages/login /app/packages/login
COPY packages/components /app/packages/components

RUN apk update && apk add make python3 g++

RUN yarn install

# Build login
WORKDIR /app/packages/components
RUN yarn build

WORKDIR /app/packages/login

ENV HOST "{{hostname}}"
ENV COUNTRY_CONFIG_URL "THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE"
RUN yarn build


# Step 2. Build the actual image

FROM nginx


COPY --from=0 /app/packages/login/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY infrastructure/nginx-default.conf /app/etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
