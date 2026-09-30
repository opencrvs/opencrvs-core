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
import { sendEmail } from './mailer'
import identities from './mock-identities.json' with { type: 'json' }

export const deactivateNid = async (nid: string) => {
  if (identities.some((identity) => identity.nid === nid)) {
    sendEmail(`NID deactivated for ${nid}`, `NID deactivated: ${nid}`)
  } else {
    sendEmail(`NID not found for ${nid}`, `NID not found: ${nid}`)
  }
}
