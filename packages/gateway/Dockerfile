FROM node:carbon
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install all dependencies of the current project.
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install

# add project src files
COPY . .

# set environment
ENV PORT=7070
ENV NODE_ENV=PRODUCTION
ENV LOG_LEVEL=30
ENV APP_NAME=OPENCRVS_API_GATEWAY

EXPOSE 7070

CMD yarn start:prod
