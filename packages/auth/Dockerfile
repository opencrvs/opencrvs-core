FROM node:gallium-alpine

WORKDIR /app

COPY . .

RUN rm -rf /app/packages/*

COPY packages/auth /app/packages/auth
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/auth

RUN yarn build


# Step 2. Build the actual image

FROM nginx

COPY --from=0 /app/packages/auth/build/ /usr/share/nginx/html/

COPY infrastructure/nginx-deploy-config.sh /

RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]

