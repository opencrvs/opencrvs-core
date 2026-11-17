#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Reference to container within the same k8s pod
ELASTIC_HOST=${ELASTIC_HOST:-"elasticsearch:9200"}

approved_words=${ES_INDEX_PREFIXES:-"events_ ocrvs- reindexing_status"}

# Hostname for elasticsearch container
# - password protected
# - no-password access
elasticsearch_host() {
  if [ ! -z ${ELASTIC_PASSWORD+x} ]; then
    echo "elastic:$ELASTIC_PASSWORD@${ELASTIC_HOST}"
  else
    echo "${ELASTIC_HOST}"
  fi
}

indices=$(curl -sS -XGET http://$(elasticsearch_host)/_cat/indices?h=index)
echo "Running elasticsearch cleanup script..."
echo "--------------------------"
echo "🧹 cleanup for indices: $approved_words from $indices"
echo "--------------------------"
for index in $indices; do
  for approved in $approved_words; do
      case "$index" in
      "$approved"*)
          echo "Delete index $index..."
          curl -sS -XDELETE "http://$(elasticsearch_host)/$index"
          echo ""
          break
          ;;
      esac
  done
done