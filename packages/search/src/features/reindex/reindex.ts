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
import { streamAllRecords } from '@search/features/records/service'
import { Transform } from 'node:stream'

export const reindex = async (newIndex: string) => {
  const stream = await streamAllRecords(true)

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true
  })
  transformedStreamData._transform = function (item, enc, cb) {
    if (item) {
      item.last_sync_at = new Date()
      transformedStreamData.push(item)
      cb()
    } else {
      process.exit(1)
    }
  }

  stream.pipe(transformedStreamData).on('data', (stream) => {
    console.log(stream)
  })
}
