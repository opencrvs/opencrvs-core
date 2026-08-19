/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { sortBy } from 'lodash'
import { CSVRow } from './api/content/service'
import { readCSVToJSON, writeJSONToCSV } from './utils'

async function sortMessages(path: string) {
  const translations = await readCSVToJSON<CSVRow[]>(path)
  const columns = Object.keys(translations[0])

  for (const translation of translations) {
    const rowIndex = translations.indexOf(translation)
    const keys = Object.keys(translation)
    if (keys.length !== columns.length) {
      console.log(translation)

      throw new Error(
        `The file ${path} contains a row with different columns on row ${rowIndex + 1}`
      )
    }
  }

  const data = sortBy(translations, (row) => row.id)
  return writeJSONToCSV(path, data)
}

process.argv.slice(2).forEach((filePath) => sortMessages(filePath))
