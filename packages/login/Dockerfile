# Step 1. Build the javascript bundle

FROM node:hydrogen-alpine@sha256:6d9d5269cbe4088803e9ef81da62ac481c063b60cadbe8e628bfcbb12296d901
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

FROM nginx@sha256:d2cb0992f098fb075674730da5e1c6cccdd4890516e448a1db96e0245c1b7fca

RUN apt-get update && apt-get upgrade -y

COPY --from=0 /app/packages/login/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
