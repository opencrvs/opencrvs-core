# You should always specify a full version here to ensure all of your developers
# are running the same version of Node.
FROM node:9.2.1
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install and configure `serve`.
RUN yarn global add serve
CMD cd packages/login; serve -s build
EXPOSE 5000

# Copy all local files into the image (including all packages in the repo)
COPY . .

# Install all dependencies of the current project (for all packages so dependant pacakges are built and linked)
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY lerna.json lerna.json
RUN yarn install

# Build for production.
RUN cd packages/login; yarn build --production
