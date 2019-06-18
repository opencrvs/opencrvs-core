FROM node:dubnium as builder
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# Default build env
ENV REACT_APP_AUTH_API_URL=https://auth.opencrvs-staging.jembi.org/
ENV REACT_APP_REGISTER_APP_URL=https://register.opencrvs-staging.jembi.org/
ENV REACT_APP_PERFORMANCE_APP_URL=https://performance.opencrvs-staging.jembi.org/
ENV REACT_APP_COUNTRY=bgd
ENV REACT_APP_LANGUAGE=bn

# Install all dependencies of the current project (for all local packages so that dependant packages are built and linked)
COPY package.json package.json
COPY packages/login/package.json packages/login/package.json
COPY packages/components/package.json packages/components/package.json
# TODO remove the following two once components dependency on gateway is removed
COPY packages/gateway/package.json packages/gateway/package.json
COPY packages/commons/package.json packages/commons/package.json
COPY yarn.lock yarn.lock
RUN yarn install

# Copy all source files into the image (including all packages in the repo)
COPY packages/login packages/login
COPY packages/components packages/components
COPY packages/gateway packages/gateway
COPY packages/commons packages/commons

# Build for production.
RUN cd packages/components; yarn build && cd ../login; yarn build --production

# Add nginx build stage that only copies out the built webapp
FROM nginx
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/packages/login/build /usr/share/nginx/html
