# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e

sed -e s~{{COUNTRY_CONFIG_URL_INTERNAL}}~$COUNTRY_CONFIG_URL_INTERNAL~g \
    -e s~{{LOGIN_URL}}~$LOGIN_URL~g \
    -e s~{{AUTH_URL_INTERNAL}}~$AUTH_URL_INTERNAL~g \
    -e s~{{GATEWAY_URL_INTERNAL}}~$GATEWAY_URL_INTERNAL~g \
    -e s~{{CONTENT_SECURITY_POLICY_WILDCARD}}~$CONTENT_SECURITY_POLICY_WILDCARD~g \
    -e s~{{OTEL_NGINX_TRACE}}~$OTEL_NGINX_TRACE~g \
    -e s~{{OTEL_NGINX_EXPORTER_ENDPOINT}}~$OTEL_NGINX_EXPORTER_ENDPOINT~g \
    -e s~{{OTEL_NGINX_SERVICE_NAME}}~$OTEL_NGINX_SERVICE_NAME~g \
    -e s~{{OTEL_NGINX_SERVICE_NAMESPACE}}~$OTEL_NGINX_SERVICE_NAMESPACE~g \
    -e s~{{OTEL_NGINX_DEPLOYMENT_ENVIRONMENT}}~$OTEL_NGINX_DEPLOYMENT_ENVIRONMENT~g \
    -e s~{{LOGIN_URL}}~$LOGIN_URL~g \
    /etc/nginx/conf.d/default.conf > /tmp/default.conf
cat /tmp/default.conf > /etc/nginx/conf.d/default.conf

sed -e s~{{COUNTRY_CONFIG_URL_INTERNAL}}~$COUNTRY_CONFIG_URL_INTERNAL~g \
    -e s~{{LOGIN_URL}}~$LOGIN_URL~g \
    -e s~{{AUTH_URL_INTERNAL}}~$AUTH_URL_INTERNAL~g \
    -e s~{{GATEWAY_URL_INTERNAL}}~$GATEWAY_URL_INTERNAL~g \
    /usr/share/nginx/html/index.html > /tmp/index.html
cat /tmp/index.html > /usr/share/nginx/html/index.html
