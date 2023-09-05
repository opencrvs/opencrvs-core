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

CMD yarn start:prod
