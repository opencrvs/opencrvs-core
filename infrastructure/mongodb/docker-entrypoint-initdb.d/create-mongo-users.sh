
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

mongo <<EOF
  use hearth-dev
  db.createUser({
    user: 'hearth',
    pwd: '$HEARTH_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'hearth' }, { role: 'readWrite', db: 'hearth-dev' }]
  })
EOF

mongo <<EOF
  use user-mgnt
  db.createUser({
    user: 'user-mgnt',
    pwd: '$USER_MGNT_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'user-mgnt' }]
  })
EOF

mongo <<EOF
  use openhim-dev
  db.createUser({
    user: 'openhim',
    pwd: '$OPENHIM_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'openhim' }, { role: 'readWrite', db: 'openhim-dev' }]
  })
EOF

mongo <<EOF
  use application-config
  db.createUser({
    user: 'config',
    pwd: '$CONFIG_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'application-config' }]
  })
EOF

mongo <<EOF
  use webhooks
  db.createUser({
    user: 'webhooks',
    pwd: '$WEBHOOKS_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'webhooks' }]
  })
EOF