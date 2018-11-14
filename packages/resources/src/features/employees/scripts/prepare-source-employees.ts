import * as fs from 'fs'
import { EMPLOYEES_SOURCE } from '../../../constants'
import * as csv2json from 'csv2json'
const sourceJSON = `${EMPLOYEES_SOURCE}test-employees.json`

export default async function prepareSourceJSON() {
  fs.createReadStream(`${EMPLOYEES_SOURCE}test-employees.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(sourceJSON))

  return true
}

prepareSourceJSON()
