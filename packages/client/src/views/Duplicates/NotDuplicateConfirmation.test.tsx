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
import * as React from 'react'
import { NotDuplicateConfirmation } from '@client/views/Duplicates/NotDuplicateConfirmation'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'

const { store } = createStore()
const mockHandleYes = jest.fn()
const mockHandleClose = jest.fn()

describe('when user opens the log out modal', () => {
  let logoutComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <NotDuplicateConfirmation
        show={true}
        handleYes={mockHandleYes}
        handleClose={mockHandleClose}
      />,
      store
    )
    logoutComponent = testComponent.component
  })

  it('renders not a duplicate confirmation dialog', () => {
    expect(
      logoutComponent.find('#not_duplicate_confirm').hostNodes()
    ).toHaveLength(1)
  })

  it('calls yes button handler', () => {
    logoutComponent.find('#not_duplicate_confirm').hostNodes().simulate('click')

    expect(mockHandleYes).toHaveBeenCalled()
  })

  it('calls no button handler', () => {
    logoutComponent.find('#not_duplicate_close').hostNodes().simulate('click')

    expect(mockHandleClose).toHaveBeenCalled()
  })
})
