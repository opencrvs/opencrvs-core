import chalk from 'chalk'
import {
  ILocationSequenceNumber,
  matchLocationWithA2IRef
} from '@resources/bgd/features/utils'
import * as fs from 'fs'
import {
  ADMIN_STRUCTURE_SOURCE,
  SEQUENCE_NUMBER_SOURCE
} from '@resources/bgd/constants'
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
  locations: fhir.Location[],
  locWiseSeqNumbers: ILocationSequenceNumber[]
): Promise<ILocationSequenceNumberModel[]> {
  const locationsWiseSeqNumbers: ILocationSequenceNumberModel[] = []
  for (const locWiseSeqNum of locWiseSeqNumbers) {
    const location = locations.find(loc =>
      matchLocationWithA2IRef(loc, locWiseSeqNum.reference)
    )
    if (!location) {
      // tslint:disable-next-line:no-console
      console.log(
        `${chalk.red('Warning:')} No location can be found that matches: ${
          locWiseSeqNum.reference
        }`
      )
      continue
    }
    // tslint:disable-next-line:no-console
    console.log(`Saving sequence number for location: ${location.id}`)
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

  const unions = JSON.parse(
    fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.json`).toString()
  )
  // Preparing union wise sequence numbers
  let sequenceNumberModels = await prepareAndSaveLocationSequenceNumber(
    unions.unions,
    unionsNumbers
  )

  const municipalities = JSON.parse(
    fs
      .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/municipalities.json`)
      .toString()
  )
  // Preparing municipality wise sequence numbers
  sequenceNumberModels = sequenceNumberModels.concat(
    await prepareAndSaveLocationSequenceNumber(
      municipalities.municipalities,
      municipalitiesNumbers
    )
  )
  if (sequenceNumberModels.length === 0) {
    return false
  }
  // Storing sequence numbers on resource db
  createLocationWiseSeqNumbers(sequenceNumberModels)
  return true
}

saveSequenceNumberData()
