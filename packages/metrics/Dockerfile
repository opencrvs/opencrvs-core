FROM node:gallium-alpine
WORKDIR /app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .

RUN rm -rf /app/packages/*

COPY packages/metrics /app/packages/metrics
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/metrics

RUN yarn build

EXPOSE 1050

CMD yarn start:prod
