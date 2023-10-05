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
import { Bundle, Task } from '@opencrvs/commons/types'
import { MOTHER_SECTION_CODE } from '@workflow/features/registration/fhir/constants'
import {
  findPersonEntry,
  getTaskResourceFromFhirBundle
} from '@workflow/features/registration/fhir/fhir-template'
import { testFhirBundle } from '@workflow/test/utils'
import * as fetchAny from 'jest-fetch-mock'
import { cloneDeep } from 'lodash'

const fetch = fetchAny as any

describe('Verify fhir templates', () => {
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
            family: ['Doe'],
            use: 'bn'
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
            family: ['Doe'],
            use: 'bn'
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

  describe('getTaskResource', () => {
    it('returns the task resource properly when FhirBundle is sent', () => {
      const taskResourse = getTaskResourceFromFhirBundle(testFhirBundle)

      expect(taskResourse).toBeDefined()
      expect(taskResourse).toEqual(testFhirBundle.entry[1].resource)
    })
    it('returns the task resource properly when Task BundleEntry is sent', () => {
      const payload = {
        type: 'document',
        entry: [{ ...testFhirBundle.entry[1] }]
      } as Bundle<Task>
      const taskResourse = getTaskResourceFromFhirBundle(payload)

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
  })
})
