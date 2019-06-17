import {
  addDuplicatesToComposition,
  createDuplicatesTemplate
} from '@search/features/fhir/fhir-utils'
import { mockComposition } from '@search/test/utils'

describe('fhir utils', () => {
  it('should add duplicates to relatesTo property of compostion', () => {
    addDuplicatesToComposition(['123'], mockComposition)
    if (
      mockComposition.relatesTo &&
      mockComposition.relatesTo[2] &&
      mockComposition.relatesTo[2].targetReference &&
      mockComposition.relatesTo[2].targetReference.reference
    ) {
      expect(mockComposition.relatesTo[2].targetReference
        .reference as string).toEqual('Composition/123')
      expect(mockComposition.relatesTo.length).toEqual(3)
    } else {
      throw new Error('Failed')
    }
  })
  it('should not add duplicates to relatesTo property if already exists as duplicate', () => {
    createDuplicatesTemplate(['123'], mockComposition)
    if (mockComposition.relatesTo) {
      expect(mockComposition.relatesTo.length).toEqual(3)
    } else {
      throw new Error('Failed')
    }
  })
})
