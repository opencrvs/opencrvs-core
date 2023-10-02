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
import {
  fieldToIdentityTransformer,
  nestedRadioFieldToBundleFieldTransformer,
  longDateTransformer,
  eventLocationMutationTransformer
} from '@client/forms/register/mappings/mutation/field-mappings'
import { TransformedData, IFormField } from '@client/forms'

describe('Mutation FieldMapping', () => {
  const factory = fieldToIdentityTransformer('id', 'nationalId')
  const expectedResult = {
    person: { identifier: [{ id: undefined, type: 'nationalId' }] }
  }
  const draftData = {
    person: {}
  }
  const sectionId = 'person'
  const field = {} as IFormField

  it('Should return valid data', () => {
    const transformedData = {
      person: {
        identifier: undefined
      }
    }

    const result = factory(
      transformedData,
      draftData,
      sectionId,
      field as IFormField
    )

    expect(result).toEqual(expectedResult)
  })

  it('Should return valid JSON for new identity', () => {
    const transformedData = {
      person: {
        identifier: [
          {
            type: 'nationalId'
          }
        ]
      }
    }

    const result = factory(
      transformedData,
      draftData,
      sectionId,
      field as IFormField
    )
    expect(result).toEqual(expectedResult)
  })

  describe('For nested fields', () => {
    const factory = nestedRadioFieldToBundleFieldTransformer()

    const draftData = {
      registration: {
        registrationPhone: {
          value: '01711111111'
        }
      }
    }

    const expectedResult = {
      registrationPhone: '01711111111'
    }

    const sectionId = 'registration'
    const field = { name: 'registrationPhone' } as IFormField

    it('should return a valid JSON for parent field having nested fields', () => {
      const transformedData = {
        registrationPhone: ''
      }

      const result = factory(
        transformedData,
        draftData,
        sectionId,
        field as IFormField
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('For date fields', () => {
    const factory = longDateTransformer()

    const sectionId = 'mother'
    const field = { name: 'birthDate' } as IFormField

    it('should return a date string with proper long date format if there is value', () => {
      const draftData = {
        mother: {
          birthDate: '1980-1-2'
        }
      }

      const expectedResult = {
        mother: {
          birthDate: '1980-01-02'
        }
      }

      const transformedData = {
        mother: {
          birthDate: ''
        }
      }

      const result = factory(transformedData, draftData, sectionId, field)

      expect(result).toEqual(expectedResult)
    })

    it('leaves as it is as if there is no value', () => {
      const draftData = {
        mother: {
          birthDate: ''
        }
      }

      const expectedResult = {
        mother: {
          birthDate: ''
        }
      }

      const transformedData = {
        mother: {
          birthDate: ''
        }
      }

      const result = factory(transformedData, draftData, sectionId, field)

      expect(result).toEqual(expectedResult)
    })

    it('returns null if meaningless value', () => {
      const draftData = {
        mother: {
          birthDate: '--1'
        }
      }

      const expectedResult = {
        mother: {
          birthDate: null
        }
      }

      const transformedData = {
        mother: {
          birthDate: ''
        }
      }

      const result = factory(transformedData, draftData, sectionId, field)

      expect(result).toEqual(expectedResult)
    })
  })
})
describe('Child section mutation mapping related tests', () => {
  it('Test birthLocation search field', () => {
    const transformedData: TransformedData = {
      child: {}
    }
    const draftData = {
      child: {
        birthLocation: '54538456-fcf6-4276-86ac-122a7eb47703'
      }
    }
    eventLocationMutationTransformer({})(transformedData, draftData, 'child', {
      name: 'birthLocation',
      type: 'LOCATION_SEARCH_INPUT'
    } as IFormField)
    expect(transformedData.child).toBeDefined()
    expect(transformedData.eventLocation._fhirID).toEqual(
      '54538456-fcf6-4276-86ac-122a7eb47703'
    )
  })
})
