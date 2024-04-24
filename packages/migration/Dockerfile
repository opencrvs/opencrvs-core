FROM node:hydrogen-alpine@sha256:4837c2ac8998cf172f5892fb45f229c328e4824c43c8506f8ba9c7996d702430
WORKDIR /app

RUN apk update && apk upgrade

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /app/wait
RUN chmod +x /app/wait

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .

RUN rm -rf /app/packages/*

COPY packages/migration /app/packages/migration

RUN yarn install
RUN yarn build

WORKDIR /app/packages/migration

# FIXME: to be replaced later with whole build running as node
RUN chown -R node:node /app

USER node

CMD /app/wait && yarn start:prod
