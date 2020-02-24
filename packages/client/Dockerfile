FROM nginx
ARG RESOURCES_URL
ENV RESOURCES_URL=$RESOURCES_URL
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=opencrvs-build /packages/client/build /usr/share/nginx/html

ADD infrastructure/start-static-image.sh /
RUN chmod +x /start-static-image.sh
CMD ["bash", "-c", "'./start-static-image.sh'"]