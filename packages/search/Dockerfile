FROM node:erbium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/search/tsconfig.json packages/search/tsconfig.json
COPY packages/search/package.json packages/search/package.json
COPY packages/commons packages/commons
COPY yarn.lock yarn.lock
RUN yarn install --production

# Copy package source
COPY --from=opencrvs-build packages/search/build packages/search/build

# Copy dependant package(s) source
COPY --from=opencrvs-build packages/commons packages/commons

EXPOSE 9090
WORKDIR /usr/src/app/packages/search

CMD yarn start:prod
