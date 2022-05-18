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
import React from 'react'
import { ReactWrapper } from 'enzyme'
import { createStore, AppStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { History } from 'history'
import {
  ActionState,
  defaultActionState,
  ActionContext,
  ActionsModal
} from './ActionsModal'
import { PreviewTab } from './PreviewTab'
import {
  IFormDraft,
  DraftStatus
} from '@client/forms/configuration/formDrafts/utils'
import { Event } from '@client/forms'
import { updateFormConfig } from '@client/forms/configuration/formConfig/actions'

let component: ReactWrapper<{}, {}>

function WrappedPreviewTab() {
  const [actionState, setAction] = React.useReducer(
    (state: ActionState, newState: Partial<ActionState>) => ({
      ...state,
      ...newState
    }),
    defaultActionState
  )
  return (
    <ActionContext.Provider value={{ actionState, setAction }}>
      <PreviewTab />
      <ActionsModal />
    </ActionContext.Provider>
  )
}

const inPreviewDraft: IFormDraft = {
  event: Event.BIRTH,
  status: DraftStatus.PREVIEW,
  version: 1,
  history: [],
  updatedAt: Date.now(),
  createdAt: Date.now()
}

describe('PreviewTab', () => {
  let store: AppStore
  let history: History

  beforeEach(async () => {
    const Store = createStore()
    store = Store.store
    history = Store.history
    component = await createTestComponent(<WrappedPreviewTab />, {
      store,
      history
    })
    store.dispatch(updateFormConfig(inPreviewDraft))
    component.update()
  })

  it('should load properly', () => {
    expect(component.exists('PreviewTab')).toBeTruthy()
  })

  it('should show edit modal when clicked', () => {
    component.find('#edit-btn').hostNodes().first().simulate('click')
    expect(
      component.find('ActionsModal').find('ResponsiveModal').prop('show')
    ).toBeTruthy()
  })

  it('should show publish modal when clicked', () => {
    component.find('#publish-btn').hostNodes().first().simulate('click')
    expect(
      component.find('ActionsModal').find('ResponsiveModal').prop('show')
    ).toBeTruthy()
  })
})
