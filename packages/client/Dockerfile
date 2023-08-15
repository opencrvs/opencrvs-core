FROM nginx
WORKDIR /app
ARG HOST
ARG COUNTRY_CONFIG_URL
ENV HOST=$HOST
ENV COUNTRY_CONFIG_URL=$COUNTRY_CONFIG_URL

# Install Node js
ENV NODE_VERSION=16.13.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

RUN npm install -g yarn

COPY . .

RUN rm -rf /app/packages/*

COPY infrastructure/nginx-default.conf /app/etc/nginx/conf.d/default.conf
COPY packages/client /app/packages/client

COPY packages/components /app/packages/components

RUN yarn install

RUN yarn cache clean

WORKDIR /app/packages/client

RUN yarn build

WORKDIR /app

RUN ls

COPY /app/packages/client/build /usr/share/nginx/html

RUN rm -rf /app

ADD infrastructure/nginx-deploy-config.sh /
RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
