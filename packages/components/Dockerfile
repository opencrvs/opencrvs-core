# Step 1. Build the javascript bundle

FROM node:gallium-alpine
WORKDIR /app

COPY . .

# Remove packages we don't need to speed up yarn install
RUN rm -rf /app/packages/*

# Copy packages
COPY packages/components /app/packages/components

RUN apk update && apk add make python3 g++
RUN yarn install

# Build components
WORKDIR /app/packages/components
RUN yarn build-storybook


# Step 2. Build the actual image

FROM nginx

ARG HOST
ARG COUNTRY_CONFIG_URL
ENV HOST=$HOST
ENV COUNTRY_CONFIG_URL=$COUNTRY_CONFIG_URL

COPY --from=0 /app/packages/components/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /
COPY infrastructure/nginx-default.conf /app/etc/nginx/conf.d/default.conf

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
