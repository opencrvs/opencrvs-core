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
  getAgeInDays,
  populateBundleFromPayload
} from '@metrics/features/registration/utils'
import { fetchFHIR } from '@metrics/api'

describe('Verify age in days conversion', () => {
  it('Return valid age in days', () => {
    const birthDate = '2019-02-28'

    const ageInDays = getAgeInDays(
      birthDate,
      new Date('2019-03-12T07:35:42.043Z')
    )
    expect(ageInDays).toEqual(12)
  })
})

describe('.populateBundleFromPayload()', () => {
  it('return a populated bundle', async () => {
    ;(fetchFHIR as jest.Mock)
      .mockResolvedValueOnce({
        resourceType: 'Composition',
        section: [
          { entry: [{ reference: 'Patient/111' }] },
          { entry: [{ reference: 'Patient/222' }] },
          { entry: [{ reference: 'Patient/333' }] }
        ]
      })
      .mockResolvedValueOnce({ id: '111', resourceType: 'Patient' })
      .mockResolvedValueOnce({ id: '222', resourceType: 'Patient' })
      .mockResolvedValueOnce({ id: '333', resourceType: 'Patient' })

    const bundle = await populateBundleFromPayload(
      {
        resourceType: 'Task',
        focus: { reference: 'Composition/123' },
        status: 'ready',
        intent: ''
      },
      'Bearer xyz'
    )

    expect(bundle).toBeDefined()
    expect(bundle.entry).toHaveLength(5)
  })

  it('should throw error when bundle is malformed', async () => {
    expect(
      populateBundleFromPayload(
        // @ts-ignore
        {},
        'Bearer xyz'
      )
    ).rejects.toThrowError('Bundle not properly formed')
  })

  it('should throw error when bundle has no task', async () => {
    expect(
      populateBundleFromPayload(
        // @ts-ignore
        {
          resourceType: 'Bundle',
          entry: []
        },
        'Bearer xyz'
      )
    ).rejects.toThrowError('No task resource available')
  })

  it('should throw error when composition could not be fetched', async () => {
    ;(fetchFHIR as jest.Mock).mockResolvedValueOnce(undefined)

    expect(
      populateBundleFromPayload(
        {
          resourceType: 'Task',
          status: 'ready',
          intent: ''
        },
        'Bearer xyz'
      )
    ).rejects.toThrowError(
      "Could not fetch composition as the task didn't have a focus reference"
    )
  })

  it('should throw error when composition could not be fetched', async () => {
    ;(fetchFHIR as jest.Mock).mockResolvedValueOnce(undefined)

    expect(
      populateBundleFromPayload(
        {
          resourceType: 'Task',
          focus: { reference: 'Composition/123' },
          status: 'ready',
          intent: ''
        },
        'Bearer xyz'
      )
    ).rejects.toThrowError(
      'Composition Composition/123 not found on FHIR store'
    )
  })
})
