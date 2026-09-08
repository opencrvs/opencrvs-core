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
import { vi } from 'vitest'
import {
  ActionType,
  DocumentPath,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { CACHE_NAME } from '@client/v2-events/cache'
import { getUncachedFilepaths } from './cache'

const IMAGE_PATH = 'image.jpg' as DocumentPath
const SIGNATURE_PATH = 'signature.png' as DocumentPath

/*
 * A stand-in for the service worker's runtime cache, which does not exist in
 * jsdom. Keyed by the absolute URL a file is stored under.
 */
function stubCacheStorage(entries: Record<string, string>) {
  const store = new Map(
    Object.entries(entries).map(([url, contentType]) => [
      url,
      new Response('', { headers: { 'Content-Type': contentType } })
    ])
  )

  vi.stubGlobal('caches', {
    keys: () => Promise.resolve([CACHE_NAME]),
    match: (url: string) => Promise.resolve(store.get(url))
  })
}

const declared = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    {
      type: ActionType.DECLARE,
      declarationOverrides: {
        'applicant.image': {
          path: IMAGE_PATH,
          originalFilename: 'dp.jpg',
          type: 'image/jpeg'
        }
      }
    }
  ]
})

/*
 * A record's files are its documents plus the signature the action was signed
 * with, which lives on the action rather than in the declaration.
 */
const event = {
  ...declared,
  actions: declared.actions.map((action, index) =>
    index === declared.actions.length - 1
      ? { ...action, createdBySignature: SIGNATURE_PATH }
      : action
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('getUncachedFilepaths', () => {
  test('lists the files the cache cannot answer', async () => {
    stubCacheStorage({ [`/${IMAGE_PATH}`]: 'binary/octet-stream' })

    expect(await getUncachedFilepaths(event)).toEqual([SIGNATURE_PATH])
  })

  test('lists nothing when every file is cached', async () => {
    stubCacheStorage({
      [`/${IMAGE_PATH}`]: 'binary/octet-stream',
      [`/${SIGNATURE_PATH}`]: 'binary/octet-stream'
    })

    expect(await getUncachedFilepaths(event)).toEqual([])
  })

  /*
   * The SPA shell cached under a file's own URL is what makes a broken image
   * stick: it is a cache hit, so nothing would otherwise replace it.
   */
  test('counts an entry holding the SPA shell as uncached', async () => {
    stubCacheStorage({
      [`/${IMAGE_PATH}`]: 'text/html',
      [`/${SIGNATURE_PATH}`]: 'binary/octet-stream'
    })

    expect(await getUncachedFilepaths(event)).toEqual([IMAGE_PATH])
  })
})
