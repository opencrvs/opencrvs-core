import { createDuplicateTemplate } from 'src/features/fhir/fhir-utils'
import {
  mockComposition,
  mockSearchResponse,
  mockCompositionBody
} from 'src/test/utils'

describe('fhir utils', () => {
  it('should add duplicates to relatesTo property of compostion', () => {
    createDuplicateTemplate(['123'], mockComposition)
    expect(mockComposition.relatesTo[2].targetReference.reference).toEqual(
      'Composition/123'
    )
    expect(mockComposition.relatesTo.length).toEqual(3)
  })
  it('should not add duplicates to relatesTo property if already exists as duplicate', () => {
    expect(mockComposition.relatesTo.length).toEqual(3)
  })
})
