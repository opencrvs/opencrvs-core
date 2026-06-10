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
import * as React from 'react'
import { waitFor } from '@testing-library/react'
import { getStorageUserDetailsSuccess } from '@client/profile/profileActions'
import { storage } from '@client/storage'
import {
  createTestComponent,
  createTestStore,
  userDetails
} from '@client/tests/util'
import { VersionMismatchModal } from './VersionMismatchModal'

describe('VersionMismatchModal', () => {
  it('drops the persisted react-query cache of the current user on re-login', async () => {
    const { store } = await createTestStore()
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))

    const originalLocation = window.location
    delete (window as { location?: Location }).location
    window.location = { ...originalLocation, assign: vi.fn() }

    const { component } = await createTestComponent(
      <VersionMismatchModal show={true} />,
      { store }
    )

    component.find('#login').hostNodes().simulate('click')

    await waitFor(() => {
      expect(storage.removeItem).toHaveBeenCalledWith(
        `react-query-${userDetails.id}`
      )
    })
    expect(storage.removeItem).toHaveBeenCalledWith(
      `react-query-large-query-storage-${userDetails.id}`
    )
    expect(window.location.assign).toHaveBeenCalled()

    window.location = originalLocation
  })
})
