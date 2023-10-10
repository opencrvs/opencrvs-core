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

import { clone, cloneDeep } from 'lodash'
import { DOWNLOADED_EXTENSION_URL } from '@gateway/features/fhir/constants'
import { Bundle, Task } from '@opencrvs/commons/types'

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
        mockFhirBundleCloned as Bundle,
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
        mockFhirBundleCloned as Bundle,
        { _index: { certificates: 0 } },
        'BIRTH'
      )
      expect(patientEntry).toBeDefined()
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
      expect(composition.relatesTo?.length).toEqual(1)
    })

    it('should remove all duplicates', async () => {
      const mockCompositionCloned = clone(mockComposition)
      const composition = await removeDuplicatesFromComposition(
        // @ts-ignore
        mockCompositionCloned,
        '123'
      )
      expect(composition.relatesTo?.length).toEqual(0)
    })
  })
  describe('setInformantReference()', () => {
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
            mockFhirBundleCloned as Bundle
          ),
          mockFhirBundleCloned as Bundle,
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
    } as Task

    it('should return the status if the extension was found', () => {
      expect(getDownloadedExtensionStatus(task)).toBe('test-value')
    })

    it('should return undefined if the extension was not found', () => {
      expect(
        getDownloadedExtensionStatus({ ...task, extension: [] })
      ).toBeUndefined()
    })
  })
})
