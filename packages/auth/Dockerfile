FROM node:gallium-alpine

WORKDIR /app

COPY . .

RUN rm -rf /app/packages/*
RUN rm -rf /app/node_modules/*
RUN rm -rf /app/data/*
RUN rm -rf /app/.git/*

COPY packages/auth /app/packages/auth
COPY packages/commons /app/packages/commons

RUN yarn install

# RUN du -h -d 1 | sort -n
RUN ls -lh

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/auth

RUN yarn build

EXPOSE 4040

CMD yarn start:prod
