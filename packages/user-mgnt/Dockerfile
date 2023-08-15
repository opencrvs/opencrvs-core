FROM node:gallium-alpine
WORKDIR /app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .

RUN rm -rf /app/packages/*

COPY packages/user-mgnt /app/packages/user-mgnt
COPY packages/commons /app/packages/commons

RUN yarn install

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/user-mgnt

RUN yarn build

EXPOSE 3030

CMD yarn start:prod
