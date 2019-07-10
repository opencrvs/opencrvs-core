# This dockerfile only installs dependencies and build all packages
# It is used by each packages Dockerfile to copy out build artifacts

FROM node:dubnium as build

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

COPY . .
RUN yarn install && yarn build
