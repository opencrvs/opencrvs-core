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

import {
  getContentKey,
  IConfigFormField,
  getCertificateHandlebar
} from './formDraftUtils'

const configFormField: IConfigFormField = {
  fieldId: 'event.section.group.fieldId',
  precedingFieldId: null,
  foregoingFieldId: null,
  enabled: 'enabled',
  required: true,
  custom: false,
  definition: {
    name: 'dummyField',
    type: 'TEXT',
    label: {
      id: 'test.dummy'
    },
    mapping: {
      template: ['dummyHandlebar', () => {}]
    },
    validate: [() => undefined]
  }
}

describe('getContentKey', () => {
  it('should return the key if available', () => {
    expect(getContentKey(configFormField)).toBe('test.dummy')
  })
})

describe('getCertificateHandlebar', () => {
  it('should return the certificate handlebar if available', () => {
    expect(getCertificateHandlebar(configFormField)).toBe('dummyHandlebar')
  })
})
