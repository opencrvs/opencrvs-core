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
import * as mongoose from 'mongoose'
import { MONGO_URL } from '@resources/constants'
import LocationSequenceNumber, {
  ILocationSequenceNumberModel
} from '@resources/bgd/features/generate/sequenceNumbers/model/locationSequenceNumber'

export function createLocationWiseSeqNumbers(
  seqNumbers: ILocationSequenceNumberModel[]
) {
  mongoose.connect(MONGO_URL)
  function onInsert(err: any, values: any) {
    if (!err) {
      mongoose.disconnect()
    } else {
      throw Error(
        `Cannot save ${JSON.stringify(values)} to resource db ... ${err}`
      )
    }
  }
  LocationSequenceNumber.collection.insertMany(seqNumbers, onInsert)
}
