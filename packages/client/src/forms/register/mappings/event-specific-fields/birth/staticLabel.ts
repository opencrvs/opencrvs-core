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
import { MessageDescriptor } from 'react-intl'

export function getMotherDateOfBirthLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  }
}

export function getFatherDateOfBirthLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  }
}

export function getDateOfMarriageLabel(): MessageDescriptor {
  return {
    id: 'form.field.label.dateOfMarriage',
    defaultMessage: 'Date of marriage',
    description: 'Option for form field: Date of marriage'
  }
}
