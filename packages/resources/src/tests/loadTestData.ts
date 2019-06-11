import * as fs from 'fs'
import chalk from 'chalk'
import { TEST_SOURCE } from '@resources/constants'
import { sendToFhir } from '@resources/features/utils/bn'
import { Response } from 'node-fetch'

// tslint:disable-next-line:no-console
console.log(
  `${chalk.blueBright(
    '/////////////////////////// LOADING TEST DATA ///////////////////////////'
  )}`
)

async function importTestData(
  fhirLocations: fhir.Location[]
): Promise<fhir.Location[]> {
  const newLocations: fhir.Location[] = []
  for (const location of fhirLocations) {
    const savedLocationResponse = (await sendToFhir(
      location,
      '/Location',
      'POST'
    ).catch(err => {
      throw Error('Cannot save location to FHIR')
    })) as Response
    const locationHeader = savedLocationResponse.headers.get(
      'location'
    ) as string
    location.id = locationHeader.split('/')[3]
    // tslint:disable-next-line:no-console
    console.log('Location saved: ', locationHeader.split('/')[3])
    newLocations.push(location)
  }
  return newLocations
}

const testData = JSON.parse(
  fs.readFileSync(`${TEST_SOURCE}testData.json`).toString()
)

export default async function saveTestData() {
  const locations = await importTestData(testData.testLocations)
  fs.writeFileSync(
    `${TEST_SOURCE}locations.json`,
    JSON.stringify({ locations }, null, 2)
  )
}

saveTestData()
