# Step 1. Build the javascript bundle

FROM node:hydrogen-alpine@sha256:c7620fdecfefb96813da62519897808775230386f4c8482e972e37b8b18cb460
WORKDIR /app

COPY . .

# Remove packages we don't need to speed up yarn install
RUN rm -rf /app/packages/*

# Copy packages
COPY packages/login /app/packages/login
COPY packages/components /app/packages/components

RUN apk update && apk upgrade && apk add --no-cache make python3 g++

RUN yarn install

# Build login
WORKDIR /app/packages/components
RUN yarn build

WORKDIR /app/packages/login

ENV CONTENT_SECURITY_POLICY_WILDCARD "{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL "THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE"
RUN yarn build


# Step 2. Build the actual image

FROM nginx@sha256:6db391d1c0cfb30588ba0bf72ea999404f2764febf0f1f196acd5867ac7efa7e

RUN apt-get update && apt-get upgrade -y

COPY --from=0 /app/packages/login/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
