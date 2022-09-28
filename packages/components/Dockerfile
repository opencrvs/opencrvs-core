FROM node:14.18.0-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/components/package.json packages/components/package.json
COPY packages/gateway/package.json packages/gateway/package.json
COPY packages/commons packages/commons
COPY yarn.lock yarn.lock
RUN yarn install

# Copy package source
COPY packages/components packages/components

# Copy dependant package(s) source
# TODO these dependencies seem unecessary, we should try remove them. It won't build without these.
COPY packages/gateway packages/gateway
COPY packages/commons packages/commons

# set environment
ENV VITE_APP_COUNTRY='gbr'
ENV VITE_APP_LANGUAGE='en'

EXPOSE 6060
WORKDIR /usr/src/app/packages/components

CMD ["sh","-c","yarn start"]
