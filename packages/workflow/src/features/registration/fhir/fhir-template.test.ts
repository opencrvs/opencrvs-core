import { selectOrCreateTaskRefResource, findPersonEntry } from './fhir-template'
import { OPENCRVS_SPECIFICATION_URL, MOTHER_SECTION_CODE } from './constants'
import { testFhirBundle } from 'src/test/utils'
import { cloneDeep } from 'lodash'

describe('Verify fhir templates', () => {
  it('SelectOrCreateTaskRefResource successfully creates and push task entry if it is missing', () => {
    const fhirBundle = { resourceType: 'Bundle', type: 'documet' }

    const taskResource = selectOrCreateTaskRefResource(fhirBundle)

    expect(taskResource).toBeDefined()
    expect(taskResource).toEqual({
      resourceType: 'Task',
      status: 'requested',
      code: {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}types`,
            code: 'birth-registration'
          }
        ]
      }
    })
  })
  it('SelectOrCreateTaskRefResource returs the existig task resource if it is already part of fhir bundle', () => {
    const taskResource = selectOrCreateTaskRefResource(testFhirBundle)

    expect(taskResource).toBeDefined()
    expect(taskResource).toEqual({
      resourceType: 'Task',
      status: 'requested',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      },
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/paper-form-id',
          value: '12345678'
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/contact-person',
          valueString: 'MOTHER'
        }
      ]
    })
  })
  it('FindPersonEntry returns the right person entry', () => {
    const personEntryResourse = findPersonEntry(
      MOTHER_SECTION_CODE,
      testFhirBundle
    )

    expect(personEntryResourse).toBeDefined()
    expect(personEntryResourse).toEqual({
      resourceType: 'Patient',
      active: true,
      name: [
        {
          given: ['Jane'],
          family: ['Doe']
        }
      ],
      gender: 'female',
      telecom: [
        {
          system: 'phone',
          value: '+8801622688231'
        }
      ]
    })
  })
  it('FindPersonEntry throws error for invalid section code', () => {
    expect(() =>
      findPersonEntry('INVALID_SECTION_CODE', testFhirBundle)
    ).toThrowError(
      'Invalid person section found for given code: INVALID_SECTION_CODE'
    )
  })
  it('FindPersonEntry throws error for invalid section reference on composite entry', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[0].resource.section[1].entry[0].reference =
      'INVALID_REF_MOTHER_ENTRY'
    expect(() => findPersonEntry(MOTHER_SECTION_CODE, fhirBundle)).toThrowError(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  })
})
