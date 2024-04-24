FROM node:hydrogen-alpine@sha256:4837c2ac8998cf172f5892fb45f229c328e4824c43c8506f8ba9c7996d702430

WORKDIR /app

RUN apk update && apk upgrade

COPY . .

RUN rm -rf /app/packages/*

COPY packages/workflow /app/packages/workflow
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons
RUN yarn build

WORKDIR /app/packages/workflow
RUN yarn build

# FIXME: to be replaced later with whole build running as node
RUN chown -R node:node /app

USER node

CMD yarn start:prod
