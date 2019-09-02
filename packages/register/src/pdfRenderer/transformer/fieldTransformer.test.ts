import { mockApplicationData } from '@register/tests/util'
import { fieldTransformers } from '@register/pdfRenderer/transformer/fieldTransformer'
import { createIntl } from 'react-intl'
import { Event } from '@register/forms'
import { IApplication } from '@register/applications'

describe('PDF template field transformer tests', () => {
  const application: IApplication = {
    id: 'sample',
    data: mockApplicationData,
    event: Event.BIRTH
  }
  describe('IntlLabel transformer tests', () => {
    it('Returns right message', () => {
      const intl = createIntl({
        locale: 'en',
        messages: {
          'certificate.receipt.childBorned': '{firstName} has born.'
        }
      })

      const transformedValue = fieldTransformers.IntlLabel(application, intl, {
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

      expect(() => fieldTransformers.IntlLabel(application, intl)).toThrowError(
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

      const transformedValue = fieldTransformers.ApplicantName(
        application,
        intl,
        {
          key: {
            birth: 'child'
          },
          format: {
            bn: ['firstNames', 'familyName']
          }
        }
      )
      expect(transformedValue).toEqual('গায়ত্রী স্পিভক')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        fieldTransformers.ApplicantName(application, intl)
      ).toThrowError('No payload found for this transformer')
    })
    it('Throws exception if data key is not provided for the right event', () => {
      const intl = createIntl({
        locale: 'bn'
      })

      expect(() =>
        fieldTransformers.ApplicantName(application, intl, {
          key: {
            death: 'child'
          },
          format: {
            bn: ['firstNames', 'familyName']
          }
        })
      ).toThrowError('No data key defined on payload for event: birth')
    })
  })
  describe('FieldValue transformer tests', () => {
    it('Returns the right value based on provided key', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.FieldValue(application, intl, {
        valueKey: 'mother.dateOfMarriage'
      })
      expect(transformedValue).toEqual('1972-09-19')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        fieldTransformers.FieldValue(application, intl)
      ).toThrowError('No payload found for this transformer')
    })
  })
  describe('DateFieldValue transformer tests', () => {
    it('Returns the formatted date value based on provided key and format', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.DateFieldValue(
        application,
        intl,
        {
          key: { birth: 'mother.dateOfMarriage' },
          format: 'DD.MM.YYYY'
        }
      )
      expect(transformedValue).toEqual('19.09.1972')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        fieldTransformers.DateFieldValue(application, intl)
      ).toThrowError('No payload found for this transformer')
    })
  })
  describe('FormattedFieldValue transformer tests', () => {
    it('Returns the formatted value based on provided formated key', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.FormattedFieldValue(
        application,
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
        fieldTransformers.FormattedFieldValue(application, intl)
      ).toThrowError('No payload found for this transformer')
    })
  })
  describe('ConditionExecutor transformer tests', () => {
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        fieldTransformers.ConditionExecutor(application, intl)
      ).toThrowError('No payload found for this transformer')
    })
  })
  describe('NumberConversion transformer tests', () => {
    it('Returns the converted number based on given format', () => {
      const intl = createIntl({
        locale: 'en'
      })

      const transformedValue = fieldTransformers.NumberConversion(
        application,
        intl,
        {
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
        }
      )
      expect(application.data.mother.iD).toEqual('6546511876932')
      expect(transformedValue).toEqual('৬৫৪৬৫১১৮৭৬৯৩২')
    })
    it('Throws exception if payload is not provided', () => {
      const intl = createIntl({
        locale: 'en'
      })

      expect(() =>
        fieldTransformers.NumberConversion(application, intl)
      ).toThrowError('No payload found for this transformer')
    })
  })
})
