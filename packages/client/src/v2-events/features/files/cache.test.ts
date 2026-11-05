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

describe('cacheFiles', () => {
  test("passes the record's id so files outside events/ can be authorized", async () => {
    // ./useFileUpload may already be imported by the test setup, so a normal
    // vi.mock can't replace precacheFile. Reset modules and import it fresh
    // after mocking.
    vi.resetModules()
    vi.doMock('./useFileUpload', () => ({ precacheFile: vi.fn() }))
    const { precacheFile } = await import('./useFileUpload')
    const { cacheFiles } = await import('./cache')

    const event = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
    })

    await cacheFiles(event)

    expect(precacheFile).toHaveBeenCalled()
    for (const [, options] of vi.mocked(precacheFile).mock.calls) {
      expect(options).toEqual({ eventId: event.id })
    }
  })
})
