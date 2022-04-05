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
import { typeResolvers } from '@gateway/features/formDraft/type-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('FormDraft type resolvers', () => {
  it('fetches and returns a questions array', async () => {
    fetch.mockResponseOnce(JSON.stringify([{ fieldId: 'birth.dummy' }]))

    // @ts-ignore
    const questions = await typeResolvers.FormDraft.questions({}, {})
    expect(questions).toEqual([{ fieldId: 'birth.dummy' }])
  })
})
