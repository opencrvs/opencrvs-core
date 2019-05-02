FROM node:dubnium
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install all dependencies of the current project.
COPY package.json package.json
# TODO yarn.lock is not being created locally when using yarn workspaces...
# COPY yarn.lock yarn.lock
RUN yarn install

# add project src files
COPY . .

# set environment
ENV PORT=2020
ENV HOST=0.0.0.0
# TODO change this for production
ENV NODE_ENV=DEVELOPMENT

EXPOSE 2020

CMD yarn start:prod
