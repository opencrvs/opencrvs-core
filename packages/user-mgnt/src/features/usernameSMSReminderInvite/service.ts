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
import fetch from 'node-fetch'
import { NOTIFICATION_SERVICE_URL } from '@user-mgnt/constants'

// export async function sendUserName(
//   mobile: string,
//   username: string,
//   authHeader: { Authorization: string }
// ) {
//   const url = `${NOTIFICATION_SERVICE_URL}retrieveUserNameSMS`
//   const res = await fetch(url, {
//     method: 'POST',
//     body: JSON.stringify({ msisdn: mobile, username }),
//     headers: {
//       'Content-Type': 'application/json',
//       ...authHeader
//     }
//   })
//   if (res.status !== 200) {
//     throw Error(`Unable to send username`)
//   }
// }
