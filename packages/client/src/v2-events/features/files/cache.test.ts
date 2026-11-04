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
  ActionType,
  DocumentPath,
  generateActionDocument,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { getFilepathsFromActionDocument } from './cache'

describe('getFilepathsFromActionDocument', () => {
  test('extracts document and signature filepaths', () => {
    const filepaths = getFilepathsFromActionDocument([
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.DECLARE,
        defaults: {
          createdBySignature: 'signature.png' as DocumentPath
        },
        declarationOverrides: {
          'applicant.image': {
            path: 'image.jpg' as DocumentPath,
            originalFilename: 'dp.jpg',
            type: 'jpg'
          }
        }
      })
    ])

    expect(filepaths).toContain('signature.png')
    expect(filepaths).toContain('image.jpg')
  })
})

describe('cacheFilesFromEventDocument', () => {
  test("passes the record's id so files outside events/ can be authorized", async () => {
    // ./cache is already imported by the test setup, so a normal vi.mock can't
    // replace precacheFiles. Reset modules and import it fresh after mocking.
    vi.resetModules()
    vi.doMock('@client/v2-events/cache', () => ({
      precacheFiles: vi.fn(),
      removeCached: vi.fn()
    }))
    const { precacheFiles } = await import('@client/v2-events/cache')
    const { cacheFilesFromEventDocument } = await import('./cache')

    const event = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
    })

    await cacheFilesFromEventDocument(event)

    expect(precacheFiles).toHaveBeenCalledWith(expect.any(Array), event.id)
  })
})
