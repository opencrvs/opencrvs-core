FROM node:erbium-alpine
WORKDIR /usr/src/app

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/migration packages/migration
COPY yarn.lock yarn.lock
RUN yarn install --production

WORKDIR /usr/src/app/packages/migration

CMD /wait && yarn start:prod
