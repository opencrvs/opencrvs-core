FROM node:erbium-alpine
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/documents/tsconfig.json packages/documents/tsconfig.json
COPY packages/documents/package.json packages/documents/package.json
COPY packages/commons packages/commons
COPY yarn.lock yarn.lock
RUN yarn install --production

# Copy package build
COPY --from=opencrvs-build /packages/documents packages/documents

# Copy dependant package(s) source
COPY --from=opencrvs-build packages/commons packages/commons

EXPOSE 9050
WORKDIR /usr/src/app/packages/documents

CMD yarn start:prod
