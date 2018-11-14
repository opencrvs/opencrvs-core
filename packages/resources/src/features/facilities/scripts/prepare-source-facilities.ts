import * as fs from 'fs'
import { FACILITIES_SOURCE } from '../../../constants'
import * as csv2json from 'csv2json'
const sourceJSON = `${FACILITIES_SOURCE}health-facilities.json`

export default async function prepareSourceJSON() {
  fs.createReadStream(`${FACILITIES_SOURCE}health-facilities.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(sourceJSON))

  return true
}

prepareSourceJSON()
