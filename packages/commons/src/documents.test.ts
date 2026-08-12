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

import { eventIdFromDocumentPath, FullDocumentPath } from './documents'
describe('FullDocumentPath', () => {
  it('should transform a path without slash prefix to have slash prefix', () => {
    const result = FullDocumentPath.parse(
      'ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png'
    )
    expect(result).toBe('/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png')
  })

  it('should keep slash prefix if already present', () => {
    const result = FullDocumentPath.parse(
      '/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png'
    )
    expect(result).toBe('/ocrvs/8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac.png')
  })
})

describe('eventIdFromDocumentPath', () => {
  const eventId = '8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac'

  it('reads the event id out of a record attachment path', () => {
    expect(eventIdFromDocumentPath(`events/${eventId}/photo.png`)).toBe(eventId)
  })

  it('tolerates a leading slash', () => {
    expect(eventIdFromDocumentPath(`/events/${eventId}/photo.png`)).toBe(
      eventId
    )
  })

  it('returns null for user files, which belong to no event', () => {
    expect(eventIdFromDocumentPath(`users/${eventId}/signature.png`)).toBeNull()
  })

  it('returns null for the flat keys left behind by v1', () => {
    expect(eventIdFromDocumentPath(`${eventId}.png`)).toBeNull()
  })

  /*
   * Otherwise a path like `events/../../secret.png` would be handed to an
   * authorization check that has no event to check against.
   */
  it('returns null when the second segment is not an event id', () => {
    expect(eventIdFromDocumentPath('events/..%2F..%2Fsecret.png')).toBeNull()
    expect(eventIdFromDocumentPath('events/')).toBeNull()
    expect(eventIdFromDocumentPath('events')).toBeNull()
  })
})
