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

sed -i s~THIS_WILL_BE_REPLACED_BY_RUNTIME_ENV_VARIABLE~$RESOURCES_URL~g /usr/share/nginx/html/index.html
sed -i s~{{hostname}}~$HOST~g /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'