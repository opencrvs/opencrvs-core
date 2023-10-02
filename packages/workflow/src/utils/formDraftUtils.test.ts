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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetchAny from 'jest-fetch-mock'
import { getFormDraft } from '@workflow/utils/formDraftUtils'
import { mockFormDraft } from '@workflow/test/utils'

const fetch = fetchAny as any
let token: string

describe('Verify handler', () => {
  beforeEach(() => {
    token = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:config-user'
      }
    )
  })

  it('getFormDraft returns form draft response', async () => {
    fetch.resetMocks()
    fetch.mockResponse(JSON.stringify(mockFormDraft))

    const response = await getFormDraft(token)
    expect(response[0].status).toEqual('PUBLISHED')
  })

  it('getFormDraft returns form draft response', async () => {
    fetch.mockReject(new Error('error'))
    await expect(getFormDraft(token)).rejects.toThrowError('error')
  })
})
