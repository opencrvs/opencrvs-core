FROM node:gallium-alpine

WORKDIR /app

COPY . .

RUN rm -rf /app/packages/*
RUN rm -rf /app/data/*

COPY packages/search /app/packages/search
COPY packages/commons /app/packages/commons
COPY packages/components /app/packages/components

# error TS2688: Cannot find type definition file for 'fhir'.
RUN yarn install

RUN ls
WORKDIR /app/packages
RUN ls
WORKDIR /app/data
RUN ls

WORKDIR /app/packages/commons

RUN yarn build

WORKDIR /app/packages/search

RUN yarn build

EXPOSE 9090

CMD yarn start:prod
