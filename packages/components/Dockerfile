# You should always specify a full version here to ensure all of your developers
# are running the same version of Node.
FROM node:9.2.1
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install and configure `serve`.
RUN yarn global add serve
CMD serve -s lib
EXPOSE 5000

# Install all dependencies of the current project.
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install

# Copy all local files into the image.
COPY . .

# Build for production.
RUN yarn build --production