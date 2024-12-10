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
import { MongoMemoryServer } from 'mongodb-memory-server'

export type { ProvidedContext } from 'vitest'

declare module 'vitest' {
  export interface ProvidedContext {
    MONGO_URI: string
  }
}

export default async function setup({ provide }: any) {
  const mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  provide('MONGO_URI', uri)

  return async () => {
    await mongod.stop()
  }
}
