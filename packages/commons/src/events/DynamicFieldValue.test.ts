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

import { TENNIS_CLUB_DECLARATION_FORM } from '../fixtures'
import { AddressType } from './CompositeFieldValue'
import {
  getDynamicNameValue,
  getDynamicAddressFieldValue
} from './DynamicFieldValue'
import { FieldType } from './FieldType'

const NameField = TENNIS_CLUB_DECLARATION_FORM.pages[0].fields.filter(
  (f) => f.type === FieldType.NAME
)[0]

const AddressField = TENNIS_CLUB_DECLARATION_FORM.pages[0].fields.filter(
  (f) => f.type === FieldType.ADDRESS
)[0]

describe('getDynamicNameValue', () => {
  it('builds a schema with required firstname and surname', () => {
    const schema = getDynamicNameValue(NameField)

    expect(() =>
      schema.parse({
        firstname: 'John',
        surname: 'Doe'
      })
    ).not.toThrow()

    expect(() =>
      schema.parse({
        firstname: '',
        surname: 'Doe'
      })
    ).toThrow() // firstname is required
  })

  it('allows optional middlename', () => {
    const schema = getDynamicNameValue(NameField)
    expect(() =>
      schema.parse({
        firstname: 'Jane',
        surname: 'Doe'
      })
    ).not.toThrow()
  })
})

describe('getDynamicAddressFieldValue', () => {
  it('accepts valid street keys', () => {
    const schema = getDynamicAddressFieldValue(AddressField)

    expect(() =>
      schema.parse({
        country: 'BD',
        addressType: AddressType.DOMESTIC,
        streetLevelDetails: { street: '12', town: 'Baker St' }
      })
    ).not.toThrow()
  })

  it('rejects invalid street keys', () => {
    const schema = getDynamicAddressFieldValue(AddressField)
    expect(() =>
      schema.parse({
        country: 'BD',
        addressType: AddressType.DOMESTIC,
        streetLevelDetails: { invalidKey: 'oops' }
      })
    ).toThrow()
  })
})
