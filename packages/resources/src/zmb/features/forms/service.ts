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

interface IForm {
  sections: Array<any> // no point defining full types here as we don't use them
}

interface INameField {
  firstNamesField: string
  familyNameField: string
}
interface INameFields {
  [language: string]: INameField
}

interface ICollectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField: string
  nationalityField: string
}

interface ICertificateCollectorDefinition {
  [collector: string]: ICollectorField
}
export interface IForms {
  registerForm: {
    birth: IForm
    death: IForm
  }
  certificateCollectorDefinition: {
    birth: ICertificateCollectorDefinition
    death: ICertificateCollectorDefinition
  }
}

export async function getForms(): Promise<IForms> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, './register.json'), (err, data) => {
      err ? reject(err) : resolve(JSON.parse(data.toString()))
    })
  })
}
