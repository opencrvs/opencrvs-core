import {
  mockApplicationData,
  userDetails,
  mockOfflineData
} from '@register/tests/util'
import { offlineTransformers } from '@register/pdfRenderer/transformer/offlineTransformer'
import { createIntl } from 'react-intl'
import { Event } from '@register/forms'
import { TemplateTransformerData } from './types'

describe('PDF template offline data related field transformer tests', () => {
  const data: TemplateTransformerData = {
    application: {
      id: 'sample',
      data: mockApplicationData,
      event: Event.BIRTH
    },
    userDetails,
    resource: mockOfflineData
  }
  describe('OfflineAddress transformer tests', () => {
    it('Returns right offline address', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(data, intl, {
        conditionalKeys: [
          {
            condition: {
              key: 'child.placeOfBirth',
              matchValues: ['HOSPITAL', 'OTHER_HEALTH_INSTITUTION']
            },
            addressType: 'facilities',
            addressKey: 'name',
            formattedKeys: '{child.birthLocation}'
          },
          {
            condition: {
              key: 'child.placeOfBirth',
              matchValues: ['PRIVATE_HOME', 'OTHER']
            },
            addressType: 'locations',
            addressKey: 'name',
            formattedKeys:
              '{child.addressLine4}, {child.district}, {child.state}'
          }
        ]
      })
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
        offlineTransformers.OfflineAddress(data, intl, {
          conditionalKeys: [
            {
              condition: {
                key: 'child.placeOfBirth',
                matchValues: ['INVALID']
              },
              addressType: 'locations',
              addressKey: 'name',
              formattedKeys:
                '{child.addressLine4}, {child.district}, {child.state}'
            },
            {
              condition: {
                key: 'child.invalid',
                matchValues: ['INVALID']
              },
              addressType: 'facilities',
              addressKey: 'name',
              formattedKeys: '{child.birthLocation}'
            }
          ]
        })
      ).toThrowError('No condition has matched for this transformer')
    })
    it('Returns the expected output when no key is defined to replace as param', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = offlineTransformers.OfflineAddress(data, intl, {
        conditionalKeys: [
          {
            condition: {
              key: 'child.placeOfBirth',
              matchValues: ['HOSPITAL', 'OTHER_HEALTH_INSTITUTION']
            },
            addressType: 'facilities',
            addressKey: 'name',
            formattedKeys: 'Dummy output'
          }
        ]
      })
      expect(transformedValue).toEqual('Dummy output')
    })
  })
})
