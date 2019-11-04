/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as bcrypt from 'bcryptjs'

// wrapping bcrypt.compare in a separate file
// and exporting this function for tests
async function comparePins(pin1: string, pin2: string) {
  return await bcrypt.compare(pin1, pin2)
}

export const pinOps = {
  comparePins
}
