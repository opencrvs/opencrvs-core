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

const { store, history } = createStore()
const mockHandleYes = jest.fn()
const mockHandleClose = jest.fn()

describe('when user opens the log out modal', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    component = await createTestComponent(
      <NotDuplicateConfirmation
        show={true}
        handleYes={mockHandleYes}
        handleClose={mockHandleClose}
      />,
      { store, history }
    )
  })

  it('renders not a duplicate confirmation dialog', () => {
    expect(component.find('#not_duplicate_confirm').hostNodes()).toHaveLength(1)
  })

  it('calls yes button handler', () => {
    component.find('#not_duplicate_confirm').hostNodes().simulate('click')

    expect(mockHandleYes).toHaveBeenCalled()
  })

  it('calls no button handler', () => {
    component.find('#not_duplicate_close').hostNodes().simulate('click')

    expect(mockHandleClose).toHaveBeenCalled()
  })
})
