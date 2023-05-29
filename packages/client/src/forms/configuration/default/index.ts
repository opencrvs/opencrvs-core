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
import { ISerializedForm } from '@client/forms'
import { birthRegisterForms } from '@client/forms/configuration/default/birth'
import { deathRegisterForms } from '@client/forms/configuration/default/death'
import { marriageRegisterForms } from '@client/forms/configuration/default/marriage'

interface IDefaultRegisterForms {
  birth: ISerializedForm
  death: ISerializedForm
  marriage: ISerializedForm
}

export const registerForms: IDefaultRegisterForms = {
  birth: birthRegisterForms,
  death: deathRegisterForms,
  marriage: marriageRegisterForms
}

export const PlaceholderPreviewGroups = [
  'placeOfBirth',
  'placeOfDeath',
  'secondaryAddress',
  'primaryAddress'
]
