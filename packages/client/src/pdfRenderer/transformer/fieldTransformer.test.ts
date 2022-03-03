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
import { fieldTransformers } from '@client/pdfRenderer/transformer/fieldTransformer'
import { createIntl } from 'react-intl'
import { Event } from '@client/forms'
import { TemplateTransformerData } from './types'

describe('PDF template field transformer tests', () => {
  const data: TemplateTransformerData = {
    declaration: {
      id: 'sample',
      data: mockDeclarationData,
      event: Event.BIRTH
    },
    userDetails,
    resource: mockOfflineData
  }
  describe('IntlLabel transformer tests', () => {
    it('Returns right message', () => {
      const intl = createIntl({
        locale: 'en',
        messages: {
          'certificate.receipt.childBorned': '{firstName} has born.'
        }
      })

      const transformedValue = fieldTransformers.IntlLabel(data, intl, {
        messageDescriptor: {
          defaultMessage: '{firstName} has born.',
          description: 'Mock label for test',
          id: 'certificate.receipt.childBorned'
        },
        messageValues: {
          firstName: 'child.firstNamesEng'
        }
      })
      expect(transformedValue).toEqual('Mike has born.')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en',
        messages: {
          'certificate.receipt.childBorned': '{firstName} has born.'
        }
      })

      expect(() => fieldTransformers.IntlLabel(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
  })
  describe('ApplicantName transformer tests', () => {
    it('Returns proper name based on event and local', () => {
      const intl = createIntl({
        locale: 'bn',
        defaultLocale: 'bn'
      })

      const transformedValue = fieldTransformers.ApplicantName(data, intl, {
        conditions: [
          {
            key: {
              birth: 'child'
            },
            format: {
              bn: ['firstNames', 'familyName']
            }
          }
        ]
      })
      expect(transformedValue).toEqual('গায়ত্রী স্পিভক')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() => fieldTransformers.ApplicantName(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
    it('Throws exception if data key is not provided for the right event', () => {
      const intl = createIntl({
        locale: 'bn'
      })

      expect(() =>
        fieldTransformers.ApplicantName(data, intl, {
          conditions: [
            {
              key: {
                death: 'child'
              },
              format: {
                bn: ['firstNames', 'familyName']
              }
            }
          ]
        })
      ).toThrowError('No data key defined on payload for event: birth')
    })
  })
  describe('FieldValue transformer tests', () => {
    it('Returns the right value based on provided key', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.FieldValue(data, intl, {
        valueKey: 'mother.dateOfMarriage'
      })
      expect(transformedValue).toEqual('1972-09-19')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() => fieldTransformers.FieldValue(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
  })
  describe('DateFieldValue transformer tests', () => {
    it('Returns the formatted date value based on provided key and format', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.DateFieldValue(data, intl, {
        key: { birth: 'mother.dateOfMarriage' },
        format: 'DD.MM.YYYY'
      })
      expect(transformedValue).toEqual('19.09.1972')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() => fieldTransformers.DateFieldValue(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
  })
  describe('FormattedFieldValue transformer tests', () => {
    it('Returns the formatted value based on provided formated key', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.FormattedFieldValue(
        data,
        intl,
        {
          formattedKeys:
            '{mother.firstNamesEng} {mother.familyNameEng} has a newly born child named: {child.firstNamesEng} {child.familyNameEng}'
        }
      )
      expect(transformedValue).toEqual(
        'Liz Test has a newly born child named: Mike Test'
      )
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        fieldTransformers.FormattedFieldValue(data, intl)
      ).toThrowError('No payload found for this transformer')
    })
  })
  describe('ConditionExecutor transformer tests', () => {
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        fieldTransformers.ConditionExecutor(data, intl)
      ).toThrowError('No payload found for this transformer')
    })
  })
  describe('NumberConversion transformer tests', () => {
    it('Returns the converted number based on given format', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.NumberConversion(data, intl, {
        valueKey: 'mother.iD',
        conversionMap: {
          0: '০',
          1: '১',
          2: '২',
          3: '৩',
          4: '৪',
          5: '৫',
          6: '৬',
          7: '৭',
          8: '৮',
          9: '৯'
        }
      })
      expect(data.declaration.data.mother.iD).toEqual('6546511876932')
      expect(transformedValue).toEqual('৬৫৪৬৫১১৮৭৬৯৩২')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() => fieldTransformers.NumberConversion(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
  })
  describe('IdentifierValue transformer tests', () => {
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() => fieldTransformers.IdentifierValue(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
  })
})
