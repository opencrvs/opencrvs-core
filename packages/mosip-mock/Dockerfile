FROM node:23.9.0-bookworm-slim

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json
RUN yarn install --production --frozen-lockfile && yarn cache clean
COPY src/ src/

RUN chown -R node:node /usr/src/app

USER node

CMD ["yarn", "start"]