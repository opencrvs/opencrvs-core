FROM node:gallium-alpine
WORKDIR /app
RUN apk update && apk add make python3 g++

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .

RUN rm -rf /app/packages/*

COPY packages/documents /app/packages/documents
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons
RUN yarn build

WORKDIR /app/packages/documents
RUN yarn build


# Step 2. Build the actual image

FROM nginx

COPY --from=0 /app/packages/documents/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
