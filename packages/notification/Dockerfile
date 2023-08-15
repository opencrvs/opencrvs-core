FROM node:gallium-alpine

WORKDIR /app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .

RUN rm -rf /app/packages/*

COPY packages/notification /app/packages/notification
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/notification

RUN yarn add @types/jsonwebtoken --dev

RUN yarn build

EXPOSE 2020

CMD yarn start:prod
