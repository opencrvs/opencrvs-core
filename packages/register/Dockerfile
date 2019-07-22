FROM nginx
COPY infrastructure/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=opencrvs-build /packages/register/build /usr/share/nginx/html
