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
import { readCSVToJSON } from '@countryconfig/utils'

import { join } from 'path'

interface IMessageIdentifier {
  [key: string]: string
}

export interface ILanguage {
  lang: string
  messages: IMessageIdentifier
}

export type ILanguageDataResponse = ILanguage[]

export type CSVRow = { id: string; description: string } & Record<
  string,
  string
>

/**
 * `client.csv` holds the copy core's client package declares,
 * and is kept in sync by `opencrvs upgrade`.
 * `countryconfig.csv` holds the copy this country config
 * declares itself — event, form, field, workqueue, role and certificate
 * labels — and is never touched by an upgrade.
 * The client asks for one bundle, so the two are merged back together here.
 */
const TRANSLATION_FILES: Record<string, string[]> = {
  client: ['client', 'countryconfig']
}

/**
 * Returns [] for a file that is not there. `countryconfig.csv` is absent in
 * country configs that have not been split yet, and their copy all still lives
 * in `client.csv`.
 */
async function readTranslationFile(name: string): Promise<CSVRow[]> {
  try {
    return await readCSVToJSON<CSVRow[]>(
      join('src/translations/', `${name}.csv`)
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function getLanguages(
  application: string
): Promise<ILanguageDataResponse> {
  const files = TRANSLATION_FILES[application] ?? [application]
  const csvData = (await Promise.all(files.map(readTranslationFile))).flat()

  /*
   * Each row is keyed by the columns of the file it came from, and the two
   * files can carry different language columns — a country that added `sw` to
   * countryconfig.csv but not to client.csv, say. Reading the columns off the
   * first row alone would take them from client.csv and drop `sw` from the
   * response, so the languages are the union across the rows.
   */
  const languages = [
    ...new Set(csvData.flatMap((row) => Object.keys(row)))
  ].filter((key) => !['id', 'description'].includes(key))

  return languages.map((lang) => {
    const messages: IMessageIdentifier = {}
    csvData.forEach((row) => {
      if (row[lang] !== undefined) {
        messages[row.id] = row[lang]
      }
    })

    return {
      lang,
      messages
    }
  })
}
