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
  selectOrCreateDocRefResource,
  selectOrCreateCollectorPersonResource,
  removeDuplicatesFromComposition,
  selectOrCreateInformantSection,
  setInformantReference,
  getDownloadedExtensionStatus
} from '@gateway/features/fhir/utils'
import {
  FATHER_CODE,
  FATHER_TITLE,
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
import { DOWNLOADED_EXTENSION_URL } from '@gateway/features/fhir/constants'

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
    it('should remove only specific duplicate entry', async () => {
      const mockCompositionCloned = clone(mockComposition)
      const composition = await removeDuplicatesFromComposition(
        // @ts-ignore
        mockCompositionCloned,
        '123',
        'abc'
      )
      expect(composition.relatesTo!.length).toEqual(1)
    })

    it('should remove all duplicates', async () => {
      const mockCompositionCloned = clone(mockComposition)
      const composition = await removeDuplicatesFromComposition(
        // @ts-ignore
        mockCompositionCloned,
        '123'
      )
      expect(composition.relatesTo!.length).toEqual(0)
    })
  })
  describe('setInformantReference()', () => {
    it('sets the right person reference', async () => {
      const mockFhirBundleCloned = cloneDeep(mockFhirBundle)
      setInformantReference(
        FATHER_CODE,
        FATHER_TITLE,
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
      const mockFhirBundleCloned = cloneDeep(mockFhirBundle)
      mockFhirBundleCloned.entry[4].fullUrl = 'Invalid'

      expect(() => {
        setInformantReference(
          FATHER_CODE,
          FATHER_TITLE,
          selectOrCreateInformantSection(
            INFORMANT_CODE,
            INFORMANT_TITLE,
            mockFhirBundleCloned as ITemplatedBundle
          ),
          mockFhirBundleCloned as ITemplatedBundle,
          { authHeader: 'token' }
        )
      }).toThrow(Error)
    })
  })

  describe('getDownloadedExtensionStatus()', () => {
    const task = {
      ...mockTask,
      extension: [
        {
          url: DOWNLOADED_EXTENSION_URL,
          valueString: 'test-value'
        }
      ]
    }

    it('should return the status if the extension was found', () => {
      expect(getDownloadedExtensionStatus(task)).toBe('test-value')
    })

    it('should return undefined if the extension was not found', () => {
      expect(
        getDownloadedExtensionStatus({ ...task, extension: [] }, 'dummy-url')
      ).toBeUndefined()
    })
  })
})
