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

export async function getLanguages(
  application: string
): Promise<ILanguageDataResponse> {
  const csvData = await readCSVToJSON<CSVRow[]>(
    join('src/translations/', `${application}.csv`)
  )
  const languages = Object.keys(csvData[0]).filter(
    (key) => !['id', 'description'].includes(key)
  )

  return languages.map((lang) => {
    const messages: IMessageIdentifier = {}
    csvData.forEach((row) => {
      messages[row.id] = row[lang]
    })

    return {
      lang,
      messages
    }
  })
}
