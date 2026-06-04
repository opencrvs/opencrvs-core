#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.


set -o pipefail
apk add curl jq grep

# Define common variables
kibana_alerting_api_url="${KIBANA_URL}/api/alerting/rules/_find?page=1&per_page=100&default_search_operator=AND&sort_field=name&sort_order=asc"

http_status_from_curl_output() {
  echo "$1" | tail -n1
}

response_text_from_curl_output() {
  echo "$1" | head -n-1
}

parse_url_from_string() {
  local input_string="$1"

  local url
  url=$(echo "$input_string" | grep -oP '(http|https)://[^\s]+')

  echo "$url"
}

parse_method_from_string() {
  local input_string="$1"

  local method
  method=$(echo "$input_string" | grep -oP '(?<=-X\s)[A-Z]+' || echo "GET")

  echo "$method"
}


_curl() {
  result=$(curl -s -w "\n%{http_code}" "$@")
  params="$@"
  method=$(parse_method_from_string "$params")
  request_url=$(parse_url_from_string "$params")

  http_status=$(http_status_from_curl_output "$result")
  response=$(response_text_from_curl_output "$result")

  if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
    if [ -z "$response" ]; then
      echo "$method $request_url – $http_status"
    else
      echo $response
    fi
  else
    echo "$method $request_url – $http_status" >&2
    echo "Error: HTTP request failed with status code $http_status" >&2
    exit 1
  fi
}

# FIXME: Added debug to troubleshoot https://github.com/opencrvs/opencrvs-core/issues/12114
echo "Checking Kibana status"

# Initial API status check to ensure Kibana is ready
cc=0
status_code=500
while [ "$status_code" -ne 200 ]; do
  response=$(curl -s -w "\n%{http_code}" --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD -o /dev/null -w '%{http_code}' "$kibana_alerting_api_url")
  status_code=$(http_status_from_curl_output $response)
  [ "$status_code" -ne 200 ] && echo "Kibana is not ready yet! HTTP status $status_code" && sleep 30 && ((cc++))
  [ $cc -gt 10 ] && echo "Kibana didn't startup within 5 minutes" && exit 1
done
# Delete all alerts
# FIXME: Added debug to troubleshoot https://github.com/opencrvs/opencrvs-core/issues/12114
echo "Deleting all alerts"
_curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "$kibana_alerting_api_url" | jq -r '.data[].id' | while read -r id; do
  _curl --connect-timeout 60 -X DELETE -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "${KIBANA_URL}/api/alerting/rule/$id"
done

# Import configuration
# FIXME: Added debug to troubleshoot https://github.com/opencrvs/opencrvs-core/issues/12114
echo "Import configuration"
_curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" -H 'kbn-xsrf: true' --form file=@/config/config.ndjson > /dev/null

# Re-enable all alerts
# FIXME: Added debug to troubleshoot https://github.com/opencrvs/opencrvs-core/issues/12114
echo "Re-enable alerts"
_curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "$kibana_alerting_api_url" | jq -r '.data[].id' | while read -r id; do
  _curl --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "${KIBANA_URL}/api/alerting/rule/$id/_disable"
  _curl --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "${KIBANA_URL}/api/alerting/rule/$id/_enable"
done

echo "Setting default data view to filebeat-*"
_curl --connect-timeout 60 -X POST -H 'Content-Type: application/json' -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "${KIBANA_URL}/api/kibana/settings/defaultIndex" -d '{"value": "filebeat-*"}' || echo "Failed to set default data view, please check Kibana configuration"

echo "Kibana setup completed successfully"
