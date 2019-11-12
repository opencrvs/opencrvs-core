FROM nginx
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=opencrvs-build /packages/client/build /usr/share/nginx/html
