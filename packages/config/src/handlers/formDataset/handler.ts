/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from '@hapi/hapi'
import { internal } from '@hapi/boom'
import { csvToJSON, PlainObject } from '@config/utils/csvHelper'
import { COUNTRY_CONFIG_URL } from '@config/config/constants'
import fetch from 'node-fetch'
import FormDataset, {
  IDataset,
  IDataSetModel,
  IOption
} from '@config/models/formDataset'
import { isEmpty, camelCase } from 'lodash'
import { getTokenPayload } from '@config/utils/verifyToken'

interface IFormDataset {
  fileName: string
  base64Data: string
}

export enum RESPONSE_MESSAGES {
  SUCCESSFUL = 'SUCCESSFULL',
  NO_DATA_FOUND = 'NO_DATA_FOUND',
  TRANSLATION_MISSING = 'TRANSLATION_MISSING',
  FAILED = 'FAILED'
}

const getLanguages = async () => {
  const response = await fetch(`${COUNTRY_CONFIG_URL}/content/login`)
  const languages = (await response.json()).languages.reduce(
    (accumulator: string[], language: PlainObject) => {
      accumulator.push(language.lang)
      return accumulator
    },
    []
  )
  return languages
}

export default async function createFormDatasetHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let result = {
    status: false,
    msg: RESPONSE_MESSAGES.FAILED,
    data: {} as IDataSetModel
  }
  try {
    const { base64Data, fileName } = request.payload as IFormDataset
    const options = Buffer.from(base64Data, 'base64').toString('utf8')
    const { sub: createdBy } = getTokenPayload(request.headers.authorization)

    const csvJSON = await csvToJSON(options)
    if (csvJSON.length === 0) {
      throw Error(RESPONSE_MESSAGES.NO_DATA_FOUND)
    }

    const languages: string[] = await getLanguages()

    const formDataset: IDataset = {
      fileName,
      options: [],
      createdAt: Date(),
      createdBy
    }
    csvJSON.forEach((optionRow) => {
      const option: IOption = {
        value: optionRow.option,
        label: []
      }
      languages.forEach((language) => {
        if (isEmpty(optionRow[language])) {
          throw Error(RESPONSE_MESSAGES.TRANSLATION_MISSING)
        }
        option.label.push({
          lang: language,
          descriptor: {
            defaultMessage: optionRow[language],
            id: `custom-select.${camelCase(optionRow['en'])}`
          }
        })
      })
      formDataset.options.push(option)
    })

    const newFormDataset = await FormDataset.create(formDataset)

    result.status = true
    result.msg = RESPONSE_MESSAGES.SUCCESSFUL
    result.data = newFormDataset
  } catch (e) {
    internal(e.message)
    result.msg =
      e.message in RESPONSE_MESSAGES ? e.message : RESPONSE_MESSAGES.FAILED
  }
  return result
}
