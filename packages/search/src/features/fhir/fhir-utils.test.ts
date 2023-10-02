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
      expect(
        mockComposition.relatesTo[2].targetReference.reference as string
      ).toEqual('Composition/123')
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
