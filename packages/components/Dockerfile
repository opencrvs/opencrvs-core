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
ENV REACT_APP_COUNTRY='gbr'
ENV REACT_APP_LANGUAGE='en'

EXPOSE 6060

CMD ["sh","-c","yarn build && yarn start"]