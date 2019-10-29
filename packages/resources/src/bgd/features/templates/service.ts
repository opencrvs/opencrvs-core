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
import { readFile } from 'fs'
import { join } from 'path'
import {
  TDocumentDefinitions,
  TFontFamily,
  TFontFamilyTypes
} from 'pdfmake/build/pdfmake'

export interface IPDFTemplate {
  definition: TDocumentDefinitions
  fonts: { [language: string]: { [name: string]: TFontFamilyTypes } }
  vfs: TFontFamily
  transformers?: Array<any> // no point defining full types here as we don't use them
}

export interface ITemplates {
  receipt?: IPDFTemplate
  certificates: {
    birth: IPDFTemplate
    death: IPDFTemplate
  }
}

export async function getTemplates(): Promise<ITemplates> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, './register.json'), (err, data) => {
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    })
  })
}
