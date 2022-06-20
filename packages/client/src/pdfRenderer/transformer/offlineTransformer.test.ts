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
  mockDeclarationData,
  userDetails,
  mockOfflineData
} from '@client/tests/util'
import { offlineTransformers } from '@client/pdfRenderer/transformer/offlineTransformer'
import { createIntl } from 'react-intl'
import { Event } from '@client/utils/gateway'
import { TemplateTransformerData } from './types'

describe('PDF template offline data related field transformer tests', () => {
  const data: TemplateTransformerData = {
    declaration: {
      id: 'sample',
      data: mockDeclarationData,
      event: Event.Birth
    },
    userDetails,
    resource: mockOfflineData
  }
  describe('OfflineAddress transformer tests', () => {
    it('Returns right offline address', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(
        data,
        intl,
        {
          language: 'en',
          conditions: [
            {
              condition: {
                key: 'child.placeOfBirth',
                values: ['HEALTH_FACILITY']
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'BGD',
                localAddress: '{child.birthLocation}'
              }
            },
            {
              condition: {
                key: 'child.placeOfBirth',
                values: ['PRIVATE_HOME', 'OTHER']
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'child.country',
                localAddress:
                  '{child.addressLine4}, {child.district}, {child.state}, {child.country}'
              }
            }
          ]
        },
        [
          {
            language: 'en',
            countries: [
              {
                value: 'BGD',
                name: 'Bangladesh'
              }
            ]
          }
        ]
      )
      expect(transformedValue).toEqual(
        'Shaheed Taj Uddin Ahmad Medical College'
      )
    })
    it('Returns default offline address with running any condition', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(
        data,
        intl,
        {
          language: 'en',
          conditions: [
            {
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'BGD',
                localAddress: '{child.birthLocation}'
              }
            }
          ]
        },
        [
          {
            language: 'en',
            countries: [
              {
                value: 'BGD',
                name: 'Bangladesh'
              }
            ]
          }
        ]
      )
      expect(transformedValue).toEqual(
        'Shaheed Taj Uddin Ahmad Medical College'
      )
    })
    it('Throws exception if parameter is missing', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() => offlineTransformers.OfflineAddress(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
    it('Throws exception if no condition matches', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        offlineTransformers.OfflineAddress(
          data,
          intl,
          {
            language: 'en',
            conditions: [
              {
                condition: {
                  key: 'child.placeOfBirth',
                  values: ['INVALID']
                },
                addressType: 'locations',
                addressKey: 'name',
                addresses: {
                  countryCode: 'child.country',
                  localAddress:
                    '{child.addressLine4}, {child.district}, {child.state}, {child.country}'
                }
              },
              {
                condition: {
                  key: 'child.invalid',
                  values: ['INVALID']
                },
                addressType: 'facilities',
                addressKey: 'name',
                addresses: {
                  countryCode: 'BGD',
                  localAddress: '{child.birthLocation}'
                }
              }
            ]
          },
          [
            {
              language: 'en',
              countries: [
                {
                  value: 'BGD',
                  name: 'Bangladesh'
                }
              ]
            }
          ]
        )
      ).toThrowError('No condition has matched for OfflineAddress transformer')
    })
    it('Returns the expected output when no key is defined to replace as param', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(
        data,
        intl,
        {
          language: 'en',
          conditions: [
            {
              condition: {
                key: 'child.placeOfBirth',
                values: ['HEALTH_FACILITY']
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'BGD',
                localAddress: 'Dummy output'
              }
            }
          ]
        },
        [
          {
            language: 'en',
            countries: [
              {
                value: 'BGD',
                name: 'Bangladesh'
              }
            ]
          }
        ]
      )
      expect(transformedValue).toEqual('Dummy output')
    })
  })
  it('Returns address and country', () => {
    const intl = createIntl({
      locale: 'en'
    })
    const otherPlaceOfBirth = { ...data }
    otherPlaceOfBirth.declaration.data.child.placeOfBirth = 'PRIVATE_HOME'
    otherPlaceOfBirth.declaration.data.child.country = 'BGD'
    otherPlaceOfBirth.declaration.data.child.state =
      '65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    otherPlaceOfBirth.declaration.data.child.district =
      'bc4b9f99-0db3-4815-926d-89fd56889407'

    const transformedValue = offlineTransformers.OfflineAddress(
      otherPlaceOfBirth,
      intl,
      {
        language: 'en',
        conditions: [
          {
            condition: {
              key: 'child.placeOfBirth',
              values: ['HEALTH_FACILITY']
            },
            addressType: 'facilities',
            addressKey: 'name',
            addresses: {
              countryCode: 'BGD',
              localAddress: '{child.birthLocation}'
            }
          },
          {
            condition: {
              key: 'child.placeOfBirth',
              values: ['PRIVATE_HOME', 'OTHER']
            },
            addressType: 'locations',
            addressKey: 'name',
            addresses: {
              countryCode: 'child.country',
              localAddress: '{child.district}, {child.state}, {child.country}',
              internationalAddress:
                '{child.internationalDistrict}, {child.internationalState}, {child.country}'
            }
          }
        ]
      },
      [
        {
          language: 'en',
          countries: [
            {
              value: 'BGD',
              name: 'Bangladesh'
            }
          ]
        }
      ]
    )
    expect(transformedValue).toEqual('BARGUNA, Barisal, Bangladesh')
  })
  it('Returns international address', () => {
    const intl = createIntl({
      locale: 'en'
    })
    const internationalPlaceOfBirth = { ...data }
    internationalPlaceOfBirth.declaration.data.child.placeOfBirth =
      'PRIVATE_HOME'
    internationalPlaceOfBirth.declaration.data.child.country = 'ARB'
    internationalPlaceOfBirth.declaration.data.child.state = ''
    //@ts-ignore
    internationalPlaceOfBirth.declaration.data.child.district = undefined
    internationalPlaceOfBirth.declaration.data.child.internationalState =
      'My state'
    internationalPlaceOfBirth.declaration.data.child.internationalDistrict =
      'My district'

    const transformedValue = offlineTransformers.OfflineAddress(
      internationalPlaceOfBirth,
      intl,
      {
        language: 'en',
        conditions: [
          {
            condition: {
              key: 'child.placeOfBirth',
              values: ['HEALTH_FACILITY']
            },
            addressType: 'facilities',
            addressKey: 'name',
            addresses: {
              countryCode: 'BGD',
              localAddress: '{child.birthLocation}'
            }
          },
          {
            condition: {
              key: 'child.placeOfBirth',
              values: ['PRIVATE_HOME', 'OTHER']
            },
            addressType: 'locations',
            addressKey: 'name',
            addresses: {
              countryCode: 'child.country',
              localAddress:
                '{child.addressLine4}, {child.district}, {child.state}, {child.country}',
              internationalAddress:
                '{child.internationalDistrict}, {child.internationalState}, {child.country}'
            }
          }
        ]
      },
      [
        {
          language: 'en',
          countries: [
            {
              value: 'BGD',
              name: 'Bangladesh'
            },
            {
              value: 'ARB',
              name: 'Aruba'
            }
          ]
        }
      ]
    )
    expect(transformedValue).toEqual('My district, My state, Aruba')
  })
})
