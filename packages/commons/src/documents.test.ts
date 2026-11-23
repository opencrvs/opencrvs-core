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

import { FullDocumentPath, parseDocumentPath } from './documents'

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

describe('parseDocumentPath', () => {
  const eventId = '8ce96e03-3ab8-4f3f-bb0e-b89d42e9a7ac'
  const otherId = '4f095fc4-4312-4de2-aa38-86dcc0f71044'
  const file = 'e56d1dd3-2cd4-452a-b54e-bf3e2d830605.png'

  it('parses a record attachment path', () => {
    expect(parseDocumentPath(`events/${eventId}/${file}`)).toEqual({
      kind: 'event',
      eventId,
      path: `events/${eventId}/${file}`
    })
  })

  it('parses a user asset path', () => {
    expect(parseDocumentPath(`users/${eventId}/${file}`)).toEqual({
      kind: 'user',
      userId: eventId,
      path: `users/${eventId}/${file}`
    })
  })

  it.each([file, 'avatar.jpg', 'signature-2.png'])(
    'parses a bare legacy path %s',
    (value) => {
      expect(parseDocumentPath(value)).toEqual({ kind: 'legacy', path: value })
    }
  )

  it.each([
    `users/../events/${eventId}/${file}`,
    `events/${otherId}/../${eventId}/${file}`,
    `users/%2e%2e/events/${eventId}/${file}`,
    `events/${eventId}/%2e%2e%2F${file}`,
    `events/${eventId}/./${file}`,
    `events/not-a-uuid/${file}`,
    `events//${file}`,
    `/events/${eventId}/${file}`,
    `events/${eventId}/nested/${file}`,
    `events/${eventId}/`,
    `foo/${file}`,
    '..',
    '.',
    '.hidden',
    'a\\b.png',
    ''
  ])('rejects %s', (value) => {
    expect(parseDocumentPath(value)).toBeNull()
  })
})
