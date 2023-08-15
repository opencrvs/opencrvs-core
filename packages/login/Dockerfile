FROM nginx
WORKDIR /app
ARG HOST
ARG COUNTRY_CONFIG_URL
ENV HOST=$HOST
ENV COUNTRY_CONFIG_URL=$COUNTRY_CONFIG_URL

COPY . .

RUN rm -rf /app/packages/*

COPY packages/auth /app/packages/login

COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app/packages/login

RUN yarn build

WORKDIR /app

#COPY --from=opencrvs-build /packages/login/build /usr/share/nginx/html

RUN ls
ADD infrastructure/nginx-deploy-config.sh /app
RUN chmod +x /app/nginx-deploy-config.sh
CMD ["bash", "-c", "'/app/nginx-deploy-config.sh'"]
