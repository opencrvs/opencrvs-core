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
