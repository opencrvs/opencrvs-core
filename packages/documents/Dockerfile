FROM node:hydrogen-alpine@sha256:c698ffe060d198dcc6647be78ea1683363f12d5d507dc5ec9855f1c55966ffdd

WORKDIR /app

RUN apk update && apk upgrade

COPY . .

RUN rm -rf /app/packages/*

COPY packages/documents /app/packages/documents
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons
RUN yarn build

WORKDIR /app/packages/documents
RUN yarn build

# FIXME: to be replaced later with whole build running as node
RUN chown -R node:node /app

USER node

CMD yarn start:prod
