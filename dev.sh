# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
set -e

if [  -n "$(uname -a | grep Ubuntu)" ]; then
  OS="UBUNTU"
  else
  OS="MAC"
fi
export LANGUAGES=$1
if [ $OS == "UBUNTU" ]; then
  yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"
  else
  $MY_IP = $(hostname -I | cut -d' ' -f1)
  export LOCAL_IP=$MY_IP
  yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"
fi


