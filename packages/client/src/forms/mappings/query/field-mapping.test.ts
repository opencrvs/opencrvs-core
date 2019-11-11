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
import { identityToFieldTransformer } from '@client/forms/mappings/query/field-mappings'
import { IFormField } from '@client/forms'

describe('Query FieldMapping', () => {
  it('Should return valid data', () => {
    const factory = identityToFieldTransformer('id', 'nationalId')
    const expectedResult = {}
    const queryData = {
      person: {}
    }
    const sectionId = 'person'
    const field = {} as IFormField
    const transformedData = {}
    const result = factory(
      transformedData,
      queryData,
      sectionId,
      field as IFormField
    )

    expect(result).toEqual(expectedResult)
  })

  it('Should return a new ', () => {
    const factory = identityToFieldTransformer('id', 'nationalId')
    const expectedResult = { person: { nationalId: 151515 } }
    const queryData = {
      person: {
        identifier: [
          {
            type: 'nationalId',
            id: 151515
          }
        ]
      }
    }
    const sectionId = 'person'
    const field = { name: 'nationalId' } as IFormField
    const transformedData = {
      person: {}
    }
    const result = factory(
      transformedData,
      queryData,
      sectionId,
      field as IFormField
    )

    expect(result).toEqual(expectedResult)
  })
})
