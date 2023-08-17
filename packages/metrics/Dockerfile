FROM node:gallium-alpine
WORKDIR /app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .

RUN rm -rf /app/packages/*

COPY packages/metrics /app/packages/metrics
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/metrics

RUN yarn build


# Step 2. Build the actual image

FROM nginx

COPY --from=0 /app/packages/metrics/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
