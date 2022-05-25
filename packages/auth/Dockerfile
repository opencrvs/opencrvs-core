FROM node:erbium-alpine
WORKDIR /usr/src/app
ARG HOSTNAME
ENV HOSTNAME=$HOSTNAME
# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY packages/auth/tsconfig.json packages/auth/tsconfig.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/commons packages/commons
COPY yarn.lock yarn.lock
RUN yarn install --production

# Copy package build
COPY --from=opencrvs-build /packages/auth/build packages/auth/build

EXPOSE 4040
WORKDIR /usr/src/app/packages/auth

CMD yarn start:prod
