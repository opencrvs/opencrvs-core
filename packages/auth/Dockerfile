FROM node:hydrogen-alpine@sha256:6d9d5269cbe4088803e9ef81da62ac481c063b60cadbe8e628bfcbb12296d901

WORKDIR /app

RUN apk update && apk upgrade

COPY . .

RUN rm -rf /app/packages/*

COPY packages/auth /app/packages/auth
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons
RUN yarn build

WORKDIR /app/packages/auth
RUN yarn build

# FIXME: to be replaced later with whole build running as node
RUN chown -R node:node /app

USER node

CMD yarn start:prod
