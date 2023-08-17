FROM node:gallium-alpine

WORKDIR /app

COPY . .

RUN rm -rf /app/packages/*

COPY packages/search /app/packages/search
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/search

RUN yarn build


# Step 2. Build the actual image

FROM nginx

COPY --from=0 /app/packages/search/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]


