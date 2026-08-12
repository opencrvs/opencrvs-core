FROM alpine:3.24

RUN apk add --no-cache \
      bash \
      ca-certificates \
      curl \
      jq \
      envsubst \
      openssl \
      openssh \
      rsync \
      kubectl \
      grep

COPY packages/utilities/scripts/ /usr/local/bin/