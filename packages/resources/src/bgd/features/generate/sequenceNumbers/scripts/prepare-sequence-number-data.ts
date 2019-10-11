import * as fs from 'fs'
import { SEQUENCE_NUMBER_SOURCE } from '@resources/bgd/constants'
import * as csv2json from 'csv2json'
const unionsJSON = `${SEQUENCE_NUMBER_SOURCE}generated/unions.json`
const municipalitiesJSON = `${SEQUENCE_NUMBER_SOURCE}generated/municipalities.json`
import chalk from 'chalk'

export default async function prepareSourceJSON() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// CONVERTING SEQUENCENUMBERS CSV TO JSON ///////////////////////////'
    )}`
  )
  fs.createReadStream(`${SEQUENCE_NUMBER_SOURCE}generated/unions.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(unionsJSON))
  fs.createReadStream(`${SEQUENCE_NUMBER_SOURCE}generated/municipalities.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(municipalitiesJSON))

  return true
}

prepareSourceJSON()
