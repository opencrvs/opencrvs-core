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
  selectOrCreateTaskRefResource,
  findPersonEntry,
  getTaskResource,
  isTask
} from '@workflow/features/registration/fhir/fhir-template'
import {
  OPENCRVS_SPECIFICATION_URL,
  MOTHER_SECTION_CODE
} from '@workflow/features/registration/fhir/constants'
import { testFhirBundle } from '@workflow/test/utils'
import { cloneDeep } from 'lodash'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify fhir templates', () => {
  describe('SelectOrCreateTaskRefResource', () => {
    it('successfully creates and push task entry if it is missing', () => {
      const fhirBundle = {
        resourceType: 'Bundle',
        type: 'document',
        entry: [
          {
            fullUrl: '121',
            resource: {
              resourceType: 'composition'
            }
          }
        ]
      }

      const taskResource = selectOrCreateTaskRefResource(fhirBundle)

      expect(taskResource).toBeDefined()
      expect(taskResource).toEqual({
        resourceType: 'Task',
        status: 'requested',
        focus: {
          reference: '121'
        },
        code: {
          coding: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}types`,
              code: 'BIRTH'
            }
          ]
        }
      })
    })
    it('returns the existig task resource if it is already part of fhir bundle', () => {
      const taskResource = selectOrCreateTaskRefResource(testFhirBundle)

      expect(taskResource).toBeDefined()
      expect(taskResource).toEqual({
        resourceType: 'Task',
        status: 'requested',
        intent: '',
        focus: {
          reference: 'urn:uuid:888'
        },
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
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B5WGYJE'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+8801622688231'
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: { reference: '123' }
          }
        ]
      })
    })
  })
  describe('FindPersonEntry', () => {
    it('returns the right person entry', async () => {
      const personEntryResourse = await findPersonEntry(
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
    it('returns the right person entry when task entry is passed', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            ...testFhirBundle.entry[0].resource
          })
        ],
        [
          JSON.stringify({
            ...testFhirBundle.entry[3].resource
          })
        ]
      )
      const personEntryResourse = await findPersonEntry(MOTHER_SECTION_CODE, {
        resourceType: 'Bundle',
        type: 'document',
        entry: [
          {
            ...testFhirBundle.entry[1]
          }
        ]
      })

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
    it('throws error for invalid section code', async () => {
      await expect(
        findPersonEntry('INVALID_SECTION_CODE', testFhirBundle)
      ).rejects.toThrow(
        'Invalid person section found for given code: INVALID_SECTION_CODE'
      )
    })
    it('throws error for invalid section reference on composite entry', async () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      if (
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource &&
        fhirBundle.entry[0].resource.section &&
        fhirBundle.entry[0].resource.section[1] &&
        fhirBundle.entry[0].resource.section[1].entry &&
        fhirBundle.entry[0].resource.section[1].entry[0] &&
        fhirBundle.entry[0].resource.section[1].entry[0].reference
      ) {
        fhirBundle.entry[0].resource.section[1].entry[0].reference =
          'INVALID_REF_MOTHER_ENTRY'
        await expect(
          findPersonEntry(MOTHER_SECTION_CODE, fhirBundle)
        ).rejects.toThrow(
          'Patient referenced from composition section not found in FHIR bundle'
        )
      } else {
        throw new Error('Failed')
      }
    })
  })
  describe('isTask', () => {
    it('returns true if the reasource is a Task', () => {
      expect(isTask({ resourceType: 'Task' } as fhir.Resource)).toBeTruthy()
    })

    it('returns false if the reasource is not a Task', () => {
      expect(
        isTask({ resourceType: 'Composition' } as fhir.Resource)
      ).toBeFalsy()
    })
  })
  describe('getTaskResource', () => {
    it('returns the task resource properly when FhirBundle is sent', () => {
      const taskResourse = getTaskResource(testFhirBundle)

      expect(taskResourse).toBeDefined()
      expect(taskResourse).toEqual(testFhirBundle.entry[1].resource)
    })
    it('returns the task resource properly when Task BundleEntry is sent', () => {
      const payload = {
        type: 'document',
        entry: [{ ...testFhirBundle.entry[1] }]
      }
      const taskResourse = getTaskResource(payload)

      expect(taskResourse).toBeDefined()
      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource
      ) {
        expect(taskResourse).toEqual(testFhirBundle.entry[1].resource)
      } else {
        throw new Error('Failed')
      }
    })
    it('throws error if provided document type is not FhirBundle or FhirBundleTaskEntry ', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[0].resource.resourceType = ''
      expect(() => getTaskResource(fhirBundle)).toThrowError(
        'Unable to find Task Bundle from the provided data'
      )
    })
    it('throws error if invalid document is sent', () => {
      expect(() => getTaskResource({ type: '' })).toThrowError(
        'Invalid FHIR bundle found'
      )
    })
  })
})
