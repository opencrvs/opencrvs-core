# Step 1. Build the javascript bundle

FROM node:hydrogen-alpine@sha256:6d9d5269cbe4088803e9ef81da62ac481c063b60cadbe8e628bfcbb12296d901
WORKDIR /app

RUN apk update && apk upgrade

COPY . .

# Remove packages we don't need to speed up yarn install
RUN rm -rf /app/packages/*

# Copy packages
COPY packages/client /app/packages/client
COPY packages/components /app/packages/components
COPY packages/commons /app/packages/commons
COPY packages/gateway /app/packages/gateway

RUN apk update && apk upgrade && apk add --no-cache make python3 g++

RUN yarn install

# Build client
WORKDIR /app/packages/components
RUN yarn build

WORKDIR /app/packages/client
ENV CONTENT_SECURITY_POLICY_WILDCARD "{{CONTENT_SECURITY_POLICY_WILDCARD}}"
ENV COUNTRY_CONFIG_URL "THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE"
RUN yarn build


# Step 2. Build the actual image

FROM nginx@sha256:0463a96ac74b84a8a1b27f3d1f4ae5d1a70ea823219394e131f5bf3536674419

RUN apt-get update && apt-get upgrade -y

COPY --from=0 /app/packages/client/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
