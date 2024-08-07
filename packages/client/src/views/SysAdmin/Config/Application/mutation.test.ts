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
import { configApplicationMutations } from './mutations'
import { createStore } from '@client/store'
import { createClient } from '@client/utils/apolloClient'
import { vi } from 'vitest'

describe('When calling mutateApplicationConfig', () => {
  const { store } = createStore()
  const client = createClient(store)

  beforeEach(() => {
    const mock = vi.fn()
    mock.mockResolvedValueOnce({
      data: {
        updateApplicationConfig: {
          CURRENCY: {
            languagesAndCountry: ['en-CA'],
            isoCode: 'CAD'
          }
        }
      }
    })
    client.mutate = mock
  })
  it('Should return the updated config for application', async () => {
    const mutatedData =
      await configApplicationMutations.mutateApplicationConfig({
        CURRENCY: {
          languagesAndCountry: ['en-CA'],
          isoCode: 'CAD'
        }
      })
    if (mutatedData && mutatedData.data) {
      expect(mutatedData.data.updateApplicationConfig.CURRENCY.isoCode).toEqual(
        'CAD'
      )
    } else {
      throw new Error('Failed')
    }
  })
})
