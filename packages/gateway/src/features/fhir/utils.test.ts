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
  selectOrCreateDocRefResource,
  selectOrCreateCollectorPersonResource,
  removeDuplicatesFromComposition,
  selectOrCreateInformantSection,
  setInformantReference,
  getExtensionStatus
} from '@gateway/features/fhir/utils'
import {
  FATHER_CODE,
  INFORMANT_CODE,
  INFORMANT_TITLE
} from '@gateway/features/fhir/templates'
import {
  mockFhirBundle,
  mockComposition,
  mockTask
} from '@gateway/utils/testUtils'
import { ITemplatedBundle } from '@gateway/features/registration/fhir-builders'
import { clone, cloneDeep } from 'lodash'
import { logger } from '@gateway/logger'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as any

describe('Fhir util function testing', () => {
  describe('selectOrCreateDocRefResource()', () => {
    it('successfully creates a document entry even if section reference is wrong', () => {
      const mockFhirBundleCloned = clone(mockFhirBundle)
      // @ts-ignore
      mockFhirBundleCloned.entry[0].resource.section.push({
        title: 'Certificates',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/doc-sections',
              code: 'certificates'
            }
          ],
          text: 'Certificates'
        },
        entry: [
          {
            reference: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b266ssw4'
          }
        ]
      })
      const documentRef = selectOrCreateDocRefResource(
        'certificates',
        'Certificates',
        mockFhirBundleCloned as ITemplatedBundle,
        { _index: { certificates: 0 } },
        'certificates'
      )
      expect(documentRef).toBeDefined()
    })
  })
  describe('selectOrCreateCollectorPersonResource()', () => {
    const mockFhirBundleCloned = clone(mockFhirBundle)
    it('returns a patientEntry', () => {
      const patientEntry = selectOrCreateCollectorPersonResource(
        mockFhirBundleCloned as ITemplatedBundle,
        { _index: { certificates: 0 } },
        'BIRTH'
      )
      expect(patientEntry).toBeDefined()
    })
    it('throws error if related person has an invalid patient reference', () => {
      // @ts-ignore
      mockFhirBundleCloned.entry[mockFhirBundle.entry.length - 1] = {}

      expect(() => {
        selectOrCreateCollectorPersonResource(
          mockFhirBundleCloned as ITemplatedBundle,
          { _index: { certificates: 0 } },
          'BIRTH'
        )
      }).toThrowError(
        'No related collector person entry not found on fhir bundle'
      )
    })
  })
  describe('removeDuplicatesFromComposition()', () => {
    it('should remove only specific duplicate entry', () => {
      const mockCompositionCloned = clone(mockComposition)
      const composition = removeDuplicatesFromComposition(
        // @ts-ignore
        mockCompositionCloned,
        '123',
        'abc'
      )
      expect(composition.relatesTo.length).toEqual(1)
    })

    it('should remove all duplicates', () => {
      const mockCompositionCloned = clone(mockComposition)
      const composition = removeDuplicatesFromComposition(
        // @ts-ignore
        mockCompositionCloned,
        '123',
        '123'
      )
      expect(composition.relatesTo.length).toEqual(0)
    })
  })
  describe('setInformantReference()', () => {
    it('sets the right person reference', async () => {
      const mockFhirBundleCloned = cloneDeep(mockFhirBundle)
      await setInformantReference(
        FATHER_CODE,
        selectOrCreateInformantSection(
          INFORMANT_CODE,
          INFORMANT_TITLE,
          mockFhirBundleCloned as ITemplatedBundle
        ),
        mockFhirBundleCloned as ITemplatedBundle,
        { authHeader: 'token' }
      )
      expect(mockFhirBundleCloned.entry[8].resource.patient.reference).toEqual(
        'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221'
      )
    })
    it('throws error if person entry is missing from the bundle', async () => {
      const logSpy = jest.spyOn(logger, 'error')
      const mockFhirBundleCloned = cloneDeep(mockFhirBundle)
      mockFhirBundleCloned.entry[4].fullUrl = 'Invalid'

      setInformantReference(
        FATHER_CODE,
        selectOrCreateInformantSection(
          INFORMANT_CODE,
          INFORMANT_TITLE,
          mockFhirBundleCloned as ITemplatedBundle
        ),
        mockFhirBundleCloned as ITemplatedBundle,
        { authHeader: 'token' }
      )
      expect(logSpy).toHaveBeenLastCalledWith(
        'Expected person entry not found on the bundle'
      )
    })
    it('fetch and sets right person ref incase of missing section on bundle', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          id: '111',
          identifier: {
            system: 'urn:ietf:rfc:3986',
            value: '0ab5e4cd-a49b-4bf3-b03a-08b2e65e642a'
          },
          resourceType: 'Composition',
          status: 'preliminary',
          type: {
            coding: [
              {
                system: 'http://opencrvs.org/doc-types',
                code: 'birth-application'
              }
            ],
            text: 'Birth Application'
          },
          class: {
            coding: [
              {
                system: 'http://opencrvs.org/doc-classes',
                code: 'crvs-document'
              }
            ],
            text: 'CRVS Document'
          },
          subject: {},
          date: '2018-05-23T14:44:58+02:00',
          author: [],
          title: 'Birth Declaration',
          section: [
            {
              title: 'Child details',
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/doc-sections',
                    code: 'child-details'
                  }
                ],
                text: 'Child details'
              },
              entry: [
                {
                  reference: 'urn:uuid:ab392b88-1861-44e8-b5b0-f6e0525b2662'
                }
              ]
            },
            {
              title: "Mother's details",
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/doc-sections',
                    code: 'mother-details'
                  }
                ],
                text: "Mother's details"
              },
              entry: [
                {
                  reference: 'urn:uuid:14fc828b-281c-4a2e-a9ef-44d4361fca57'
                }
              ]
            },
            {
              title: "Father's details",
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/doc-sections',
                    code: 'father-details'
                  }
                ],
                text: "Father's details"
              },
              entry: [
                {
                  reference: 'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221'
                }
              ]
            }
          ]
        })
      )
      const mockFhirBundleCloned = cloneDeep(mockFhirBundle)
      mockFhirBundleCloned.entry[0].resource.section = []
      await setInformantReference(
        FATHER_CODE,
        selectOrCreateInformantSection(
          INFORMANT_CODE,
          INFORMANT_TITLE,
          mockFhirBundleCloned as ITemplatedBundle
        ),
        mockFhirBundleCloned as ITemplatedBundle,
        { authHeader: 'token' }
      )
      expect(mockFhirBundleCloned.entry[8].resource.patient.reference).toEqual(
        'urn:uuid:b9044443-c708-4977-b0e7-7e51ef0c9221'
      )
    })
  })

  describe('getExtensionStatus()', () => {
    const task = {
      ...mockTask,
      extension: [
        {
          url: 'test-url',
          valueString: 'test-value'
        }
      ]
    }

    it('should return the status if the extension was found', () => {
      expect(getExtensionStatus(task, 'test-url')).toBe('test-value')
    })

    it('should return undefined if the extension was not found', () => {
      expect(getExtensionStatus(task, 'dummy-url')).toBeUndefined()
    })
  })
})
