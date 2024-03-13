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
import { EditConfirmation } from '@client/views/RegisterForm/review/EditConfirmation'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { vi } from 'vitest'

const { store, history } = createStore()
const mockHandleEdit = vi.fn()
const mockHandleClose = vi.fn()

describe('when user is in the review page', () => {
  let editComponent: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const testComponent = await createTestComponent(
      <EditConfirmation
        show={true}
        handleEdit={mockHandleEdit}
        handleClose={mockHandleClose}
      />,
      { store, history }
    )
    editComponent = testComponent
  })

  it('renders edit confirmation dialog', () => {
    expect(editComponent.find('#edit_confirm').hostNodes()).toHaveLength(1)
  })

  it('mock edit button click', () => {
    editComponent.find('#edit_confirm').hostNodes().simulate('click')

    expect(mockHandleEdit).toHaveBeenCalled()
  })

  it('mock preview back button click', () => {
    editComponent.find('#preview_back').hostNodes().simulate('click')

    expect(mockHandleClose).toHaveBeenCalled()
  })
})
