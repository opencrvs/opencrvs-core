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
  changeHirerchyQueryTransformer,
  convertToLocal
} from '@client/forms/register/fieldMappings/birth/query/registration-mappings'
import { IFormField } from '@client/forms'

describe('registration query mappings tests', () => {
  it('changeHierarchyQueryTransformer test', () => {
    const queryData = {
      registration: {
        registrationPhone: '01711111111'
      }
    }

    const transformedData = {
      registration: {
        whoseContactDetails: {
          nestedFields: {}
        }
      }
    }

    const expectedTransformedData = {
      registration: {
        whoseContactDetails: {
          nestedFields: {
            registrationPhone: '01711111111'
          }
        }
      }
    }

    const field = {
      name: 'whoseContactDetails'
    } as IFormField

    changeHirerchyQueryTransformer()(
      transformedData,
      queryData,
      'registration',
      field,
      { name: 'registrationPhone' } as IFormField
    )

    expect(transformedData).toEqual(expectedTransformedData)
  })
})

describe('phone number conversion from international format back to local format', () => {
  it('replaces country code', async () => {
    expect(convertToLocal('+260211000000', 'ZMB')).toBe('0211000000')
    expect(convertToLocal('+358504700715', 'FIN')).toBe('0504700715')
    expect(convertToLocal('+237666666666', 'CMR')).toBe('666666666')
  })
})
