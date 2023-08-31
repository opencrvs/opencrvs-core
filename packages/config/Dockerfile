FROM node:gallium-alpine
WORKDIR /app

COPY . .

RUN rm -rf /app/packages/*

COPY packages/config /app/packages/config
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/config

RUN yarn build


# Step 2. Build the actual image

COPY --from=0 /app/packages/config/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
