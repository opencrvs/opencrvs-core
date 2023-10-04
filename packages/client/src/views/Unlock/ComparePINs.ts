/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as bcrypt from 'bcryptjs'
import { pinLoader } from '@client/views/Unlock/utils'

// wrapping bcrypt.compare in a separate file
// and exporting this function for tests
async function isValidPin(pin: string) {
  const userPin = await pinLoader.loadUserPin()
  return await bcrypt.compare(pin, userPin)
}

export const pinValidator = {
  isValidPin: isValidPin
}
