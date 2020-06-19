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
import { TransformedData, IFormField } from '@client/forms'
import { birthEventLocationMutationTransformer } from './child-mappings'

describe('Child section mutation mapping related tests', () => {
  it('Test birthLocation search field', () => {
    const transformedData: TransformedData = {
      child: {}
    }
    const draftData = {
      child: {
        birthLocation: '54538456-fcf6-4276-86ac-122a7eb47703'
      }
    }
    birthEventLocationMutationTransformer(0)(
      transformedData,
      draftData,
      'child',
      {
        name: 'birthLocation',
        type: 'LOCATION_SEARCH_INPUT'
      } as IFormField
    )
    expect(transformedData.child).toBeDefined()
    expect(transformedData.eventLocation._fhirID).toEqual(
      '54538456-fcf6-4276-86ac-122a7eb47703'
    )
  })
})
