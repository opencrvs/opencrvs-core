import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '@resources/constants'
import * as csv2json from 'csv2json'
const divisionsJSON = `${ADMIN_STRUCTURE_SOURCE}statistics/divisions.json`
const districtsJSON = `${ADMIN_STRUCTURE_SOURCE}statistics/districts.json`
import chalk from 'chalk'

export default async function prepareSourceJSON() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// CONVERTING EMPLOYEES CSV TO JSON ///////////////////////////'
    )}`
  )
  fs.createReadStream(`${ADMIN_STRUCTURE_SOURCE}statistics/divisions.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(divisionsJSON))
  fs.createReadStream(`${ADMIN_STRUCTURE_SOURCE}statistics/districts.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(districtsJSON))

  return true
}

prepareSourceJSON()
