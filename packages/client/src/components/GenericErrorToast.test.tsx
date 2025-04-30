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
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import * as React from 'react'
import { GenericErrorToast } from './GenericErrorToast'

describe('Test toast notification', () => {
  const { store } = createStore()

  it('checks if the appropriate toast is rendered', async () => {
    const { component } = await createTestComponent(<GenericErrorToast />, {
      store
    })

    expect(component.find('#error-toast').hostNodes()).toHaveLength(1)
  })
})
