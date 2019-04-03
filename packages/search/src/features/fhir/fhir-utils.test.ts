import {
  addDuplicatesToComposition,
  createDuplicatesTemplate
} from 'src/features/fhir/fhir-utils'
import {
  mockComposition,
  mockSearchResponse,
  mockCompositionBody
} from 'src/test/utils'
import { logger } from 'src/logger'

describe('fhir utils', () => {
  it('should add duplicates to relatesTo property of compostion', () => {
    addDuplicatesToComposition(['123'], mockComposition)
    expect(mockComposition.relatesTo[2].targetReference.reference).toEqual(
      'Composition/123'
    )
    expect(mockComposition.relatesTo.length).toEqual(3)
  })
  it('should throw error for no composition', () => {
    expect(() => addDuplicatesToComposition(['123'], undefined)).toThrow()
  })
  it('should not add duplicates to relatesTo property if already exists as duplicate', () => {
    createDuplicatesTemplate(['123'], mockComposition)
    expect(mockComposition.relatesTo.length).toEqual(3)
  })
})
