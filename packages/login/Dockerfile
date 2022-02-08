FROM nginx
ARG HOST
ARG COUNTRY_CONFIG_URL
ENV HOST=$HOST
ENV COUNTRY_CONFIG_URL=$COUNTRY_CONFIG_URL
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=opencrvs-build /packages/login/build /usr/share/nginx/html

ADD infrastructure/nginx-deploy-config.sh /
RUN chmod +x /nginx-deploy-config.sh
CMD ["bash", "-c", "'./nginx-deploy-config.sh'"]
