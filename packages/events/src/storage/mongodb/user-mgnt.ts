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

import { env } from '@events/environment'
import { MongoClient } from 'mongodb'

const url = env.USER_MGNT_MONGO_URL
const client = new MongoClient(url)

export async function getClient() {
  await client.connect()

  // Providing the database name is not necessary, it will read it from the connection string.
  // e2e-environment uses different name from deployment to deployment, so we can't hardcode it.
  return client.db()
}
