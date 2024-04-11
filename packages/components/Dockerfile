# Step 1. Build the javascript bundle

FROM node:hydrogen-alpine@sha256:6d9d5269cbe4088803e9ef81da62ac481c063b60cadbe8e628bfcbb12296d901
WORKDIR /app

RUN apk update && apk upgrade

COPY . .

# Remove packages we don't need to speed up yarn install
RUN rm -rf /app/packages/*

# Copy packages
COPY packages/components /app/packages/components

RUN apk update && apk upgrade && apk add --no-cache make python3 g++
RUN yarn install

# Build components
WORKDIR /app/packages/components
RUN yarn build-storybook


# Step 2. Build the actual image

FROM nginx@sha256:07145ce64726c77459474a1e283d45d6755d9b175c2cc0bd85fe693ee09db744

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
