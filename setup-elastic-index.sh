# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

function wait_for_elasticsearch {
  local -a args=( '-s' '-D-' '-m15' '-w' '%{http_code}' "http://localhost:9200/" )
  local -i result=1
  local output

  # retry for max 300s (60*5s)
  for _ in $(seq 1 60); do
    output="$(curl "${args[@]}" || true)"
    if [[ "${output: -3}" -eq 200 ]]; then
      result=0
      break
    fi

    sleep 5
  done

  if ((result)); then
    echo -e "\n${output::-3}"
  fi

  return $result
}

function create_elastic_index {
  local body=$1
  local index_name=$2

  local -i result=1
  local output

  output=$(curl -s -D- -m15 -w "%{http_code}" -X PUT "http://localhost:9200/$index_name" -H 'Content-Type: application/json' -d "$body")

  echo "${output}"

  if [[ "${output: -3}" -eq 200 ]]; then
    result=0
  fi

  if ((result)); then
    echo -e "\n${output::-3}\n"
  fi

  return $result
}

echo "Waiting for availability of Elasticsearch"
wait_for_elasticsearch

echo "Creating index for Elasticsearch. Index: ocrvs"
create_elastic_index "{\"settings\":{\"number_of_replicas\":0}}" "ocrvs"
