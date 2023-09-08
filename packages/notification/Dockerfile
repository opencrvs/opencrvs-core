FROM node:gallium-alpine

WORKDIR /app

COPY . .

RUN rm -rf /app/packages/*

COPY packages/notification /app/packages/notification
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons
RUN yarn build

WORKDIR /app/packages/notification
RUN yarn build

CMD yarn start:prod
