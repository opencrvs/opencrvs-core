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
import { MockedResponse } from 'react-apollo/test-links'
import { CHANGE_FORM_DRAFT_STATUS } from '@client/views/SysAdmin/Config/Forms/mutations'
import { IFormDraft } from '@client/forms/configuration/formDrafts/utils'
import { DraftStatus } from '@client/utils/gateway'
import { Event } from '@client/forms'
import {
  ActionState,
  ActionContext,
  ActionsModal,
  Actions
} from './ActionsModal'
import { AppStore, createStore } from '@client/store'
import { History } from 'history'
import { createTestComponent, flushPromises } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { ActionStatus } from '@client/views/SysAdmin/Config/Forms/utils'

const inPreviewDraft: IFormDraft = {
  event: Event.BIRTH,
  status: DraftStatus.InPreview,
  version: 1,
  history: [],
  updatedAt: Date.now(),
  createdAt: Date.now()
}

const graphqlMocks: MockedResponse[] = [
  {
    request: {
      query: CHANGE_FORM_DRAFT_STATUS,
      variables: {
        status: DraftStatus.InPreview,
        event: Event.BIRTH
      }
    },
    result: {
      data: {
        modifyDraftStatus: inPreviewDraft
      }
    }
  }
]

function WrappedActionsModal() {
  const [actionState, setAction] = React.useReducer(
    (state: ActionState, newState: Partial<ActionState>) => ({
      ...state,
      ...newState
    }),
    {
      action: Actions.PREVIEW,
      event: Event.BIRTH,
      status: ActionStatus.MODAL
    }
  )
  return (
    <ActionContext.Provider value={{ actionState, setAction }}>
      <ActionsModal />
    </ActionContext.Provider>
  )
}

let component: ReactWrapper<{}, {}>

describe('ActionsModal', () => {
  let store: AppStore
  let history: History

  beforeEach(async () => {
    const Store = createStore()
    store = Store.store
    history = Store.history
    component = await createTestComponent(<WrappedActionsModal />, {
      store,
      history,
      graphqlMocks
    })
    // wait for next event loop to get success state
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    component.update()
  })

  it('should change status properly', async () => {
    component.find('#status-change-btn').hostNodes().simulate('click')
    await flushPromises()
    expect(store.getState().formConfig.birth?.formDraft.status).toBe(
      DraftStatus.InPreview
    )
  })
})
