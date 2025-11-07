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
  generateActionDocument,
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
          createdBySignature: '/ocrvs/signature.png'
        },
        declarationOverrides: {
          'applicant.image': {
            path: '/ocrvs/image.jpg',
            originalFilename: 'dp.jpg',
            type: 'jpg'
          }
        }
      })
    ])

    expect(filepaths).toContain('/ocrvs/signature.png')
    expect(filepaths).toContain('/ocrvs/image.jpg')
  })
})
