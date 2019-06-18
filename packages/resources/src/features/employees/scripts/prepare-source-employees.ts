import * as fs from 'fs'
import { EMPLOYEES_SOURCE } from '@resources/constants'
import * as csv2json from 'csv2json'
const sourceJSON = `${EMPLOYEES_SOURCE}test-employees.json`
import chalk from 'chalk'

export default async function prepareSourceJSON() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// CONVERTING EMPLOYEES CSV TO JSON ///////////////////////////'
    )}`
  )
  fs.createReadStream(`${EMPLOYEES_SOURCE}test-employees.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(sourceJSON))

  return true
}

prepareSourceJSON()
