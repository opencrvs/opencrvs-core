FROM node:gallium-alpine

WORKDIR /app

COPY . .

RUN rm -rf /app/packages/*

COPY packages/gateway /app/packages/gateway
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons
RUN yarn build

WORKDIR /app/packages/gateway
RUN yarn build

CMD yarn start:prod
