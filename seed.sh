# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

# OpenHIM is crashing on the first seed for an unknown reason.  This is technical debt
# https://github.com/opencrvs/opencrvs-core/issues/5693#issuecomment-1663448525
for i in {1..5}; do yarn seed:database && break || sleep 15; done
