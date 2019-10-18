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

export async function getNextLocationWiseSeqNumber(locationId: string) {
  // tslint:disable-next-line
  const sequenceNumber: ILocationSequenceNumberModel | null = await LocationSequenceNumber.findOneAndUpdate(
    {
      locationId,
      year: new Date().getFullYear()
    },
    { $inc: { lastUsedSequenceNumber: 1 } },
    { new: true }
  )
  if (!sequenceNumber) {
    throw new Error(
      `No starting sequece number found for generating registration number in location: ${locationId}`
    )
  }
  return sequenceNumber
}
