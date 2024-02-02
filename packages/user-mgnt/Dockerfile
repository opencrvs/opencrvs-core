FROM node:gallium-alpine

WORKDIR /app

RUN apk update && apk upgrade

COPY . .

RUN rm -rf /app/packages/*

COPY packages/user-mgnt /app/packages/user-mgnt
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons
RUN yarn build

WORKDIR /app/packages/user-mgnt
RUN yarn build

# FIXME: to be replaced later with whole build running as node
RUN chown -R node:node /app

USER node

CMD yarn start:prod
