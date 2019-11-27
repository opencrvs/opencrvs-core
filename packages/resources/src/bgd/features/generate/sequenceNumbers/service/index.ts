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
import { MIN_SEQ_NUMBER, MAX_SEQ_NUMBER } from '@resources/bgd/constants'
import LocationSequenceNumber, {
  ILocationSequenceNumberModel
} from '@resources/bgd/features/generate/sequenceNumbers/model/locationSequenceNumber'
import { logger } from '@resources/logger'

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

export async function getNextLocationWiseSeqNumber(locationId: string) {
  // tslint:disable-next-line
  const sequenceNumber: ILocationSequenceNumberModel | null = await LocationSequenceNumber.findOneAndUpdate(
    {
      locationId
    },
    { $inc: { lastUsedSequenceNumber: 1 } },
    { new: true }
  )
  if (!sequenceNumber) {
    throw new Error(
      `No starting sequence number found for generating registration number in location: ${locationId}`
    )
  }
  //When sequence number reaches to max
  //it should rotate back to min
  if (sequenceNumber.lastUsedSequenceNumber === MAX_SEQ_NUMBER) {
    LocationSequenceNumber.findOneAndUpdate(
      {
        locationId
      },
      { lastUsedSequenceNumber: MIN_SEQ_NUMBER }
    ).catch(error => {
      logger.error(
        `Unable to rotate the 6 digit sequence number to min value. Error: ${error}`
      )
      throw error
    })
  }
  return sequenceNumber
}
