import chalk from 'chalk'
import {
  ILocationSequenceNumber,
  getLocationsByIdentifier
} from '@resources/bgd/features/utils'
import * as fs from 'fs'
import { SEQUENCE_NUMBER_SOURCE } from '@resources/bgd/constants'
import LocationSequenceNumber, {
  ILocationSequenceNumberModel
} from '@resources/bgd/features/generate/sequenceNumbers/model/locationSequenceNumber'
import { createLocationWiseSeqNumbers } from '@resources/bgd/features/generate/sequenceNumbers/service'

const unionsNumbers = JSON.parse(
  fs.readFileSync(`${SEQUENCE_NUMBER_SOURCE}/generated/unions.json`).toString()
)

const municipalitiesNumbers = JSON.parse(
  fs
    .readFileSync(`${SEQUENCE_NUMBER_SOURCE}/generated/municipalities.json`)
    .toString()
)

async function prepareAndSaveLocationSequenceNumber(
  locWiseSeqNumbers: ILocationSequenceNumber[]
): Promise<ILocationSequenceNumberModel[]> {
  const locationsWiseSeqNumbers: ILocationSequenceNumberModel[] = []

  for (const locWiseSeqNum of locWiseSeqNumbers) {
    const locations: fhir.Location[] = await getLocationsByIdentifier(
      locWiseSeqNum.reference
    )
    if (!locations || locations.length === 0) {
      // tslint:disable-next-line:no-console
      console.log(
        `${chalk.red('Warning:')} No location can be found that matches: ${
          locWiseSeqNum.reference
        }`
      )
      continue
    }
    locationsWiseSeqNumbers.push(
      new LocationSequenceNumber({
        locationId: locations[0].id,
        lastUsedSequenceNumber: locWiseSeqNum.sequence_number
      })
    )
  }
  return locationsWiseSeqNumbers
}

export default async function saveSequenceNumberData() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// ADDING LOCATION WISE SEQUENCE NUMBER IN RESOURCE DB ///////////////////////////'
    )}`
  )

  // Preparing union wise sequence numbers
  let sequenceNumberModels = await prepareAndSaveLocationSequenceNumber(
    unionsNumbers
  )

  // Preparing municipality wise sequence numbers
  sequenceNumberModels = sequenceNumberModels.concat(
    await prepareAndSaveLocationSequenceNumber(municipalitiesNumbers)
  )

  // Storing sequence numbers on resource db
  createLocationWiseSeqNumbers(sequenceNumberModels)

  return true
}

saveSequenceNumberData()
