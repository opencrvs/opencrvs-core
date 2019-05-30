import {
  selectOrCreateDocRefResource,
  selectOrCreateCollectorPersonResource,
  removeDuplicatesFromComposition
} from '@gateway/features/fhir/utils'
import { mockFhirBundle, mockComposition } from '@gateway/utils/testUtils'
import { ITemplatedBundle } from '@gateway/features/registration/fhir-builders'
import { clone } from 'lodash'

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
})
