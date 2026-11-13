# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Ports that setup.sh and dev.sh check are free before starting OpenCRVS
openCRVSPorts=(
  9200  # elasticsearch
  6379  # redis
  5432  # postgres
  3535  # rustfs-api
  3536  # rustfs-console
  4040  # auth
  7070  # gateway
  5555  # events
  9050  # documents
  3040  # testland
  3000  # client
  3020  # login
  2024  # mosip-api
  20240 # mosip-mock
  20260 # esignet-mock
)
