FROM node:gallium-alpine
WORKDIR /app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .

RUN rm -rf /app/packages/*

COPY packages/config /app/packages/config
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/config

RUN yarn build

EXPOSE 2021

CMD yarn start:prod
