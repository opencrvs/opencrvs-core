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
import { upsertAnswer } from './update-field'

describe('update field endpoint', () => {
  it('adds 1 response to 0 original responses', () => {
    const fieldId = 'fieldId'
    const valueString = 'valueString'

    const responses = upsertAnswer([], {
      fieldId,
      valueString
    })

    expect(responses).toEqual([
      {
        text: fieldId,
        answer: [{ valueString }]
      }
    ])
  })

  it('adds 1 response to 1 original responses', () => {
    const fieldId = 'fieldId'
    const valueString = 'valueString'

    const originalResponses = [
      {
        text: 'some-field',
        linkId: '',
        answer: [{ valueString: 'some-value' }]
      }
    ]
    const responses = upsertAnswer(originalResponses, {
      fieldId,
      valueString
    })

    expect(responses).toEqual([
      ...originalResponses,
      {
        text: fieldId,
        answer: [{ valueString }]
      }
    ])
  })

  it('updates 1 original response', () => {
    const fieldId = 'fieldId'

    const originalResponses = [
      {
        text: fieldId,
        linkId: '',
        answer: [{ valueString: 'some-value' }]
      }
    ]
    const responses = upsertAnswer(originalResponses, {
      fieldId,
      valueString: 'newValueString'
    })

    expect(responses).toEqual([
      {
        text: fieldId,
        answer: [{ valueString: 'newValueString' }]
      }
    ])
  })

  it('updates 1 original response and keeps 1 original response', () => {
    const fieldId = 'fieldId'

    const unrelatedField = {
      text: 'some-unrelated-field',
      linkId: '',
      answer: [{ valueString: 'some-unrelated-value' }]
    }

    const originalResponses = [
      unrelatedField,
      {
        text: fieldId,
        linkId: '',
        answer: [{ valueString: 'some-value' }]
      }
    ]
    const responses = upsertAnswer(originalResponses, {
      fieldId,
      valueString: 'newValueString'
    })

    expect(responses).toEqual([
      unrelatedField,
      {
        text: fieldId,
        answer: [{ valueString: 'newValueString' }]
      }
    ])
  })
})
