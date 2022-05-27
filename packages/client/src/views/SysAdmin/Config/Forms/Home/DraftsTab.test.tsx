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
import { DraftsTab } from './DraftsTab'
import { History } from 'history'
import { updateFormConfig } from '@client/forms/configuration/formConfig/actions'
import { IFormDraft } from '@client/forms/configuration/formDrafts/utils'
import { DraftStatus } from '@client/utils/gateway'
import { Event } from '@client/forms'
import {
  ActionState,
  defaultActionState,
  ActionContext,
  ActionsModal
} from './ActionsModal'

let component: ReactWrapper<{}, {}>

const draftHistory = [
  {
    status: DraftStatus.Draft,
    version: 1,
    updatedAt: Date.now()
  },
  {
    status: DraftStatus.Draft,
    version: 0,
    updatedAt: Date.now()
  }
]

function WrappedDraftsTab() {
  const [actionState, setAction] = React.useReducer(
    (state: ActionState, newState: Partial<ActionState>) => ({
      ...state,
      ...newState
    }),
    defaultActionState
  )
  return (
    <ActionContext.Provider value={{ actionState, setAction }}>
      <DraftsTab />
      <ActionsModal />
    </ActionContext.Provider>
  )
}

describe('DraftsTab', () => {
  let store: AppStore
  let history: History
  beforeEach(async () => {
    const Store = createStore()
    store = Store.store
    history = Store.history
    component = await createTestComponent(<WrappedDraftsTab />, {
      store,
      history
    })
  })

  it('should load properly', () => {
    expect(component.exists('DraftsTab')).toBeTruthy()
  })

  describe('when Draft status is DRAFT', () => {
    it('should not show options menu', () => {
      expect(component.exists('OptionsMenu')).toBeFalsy()
    })

    it('should not show status Pill', () => {
      expect(component.exists('Pill')).toBeFalsy()
    })

    describe('if not default draft', () => {
      beforeEach(() => {
        const newDraft: IFormDraft = {
          event: Event.BIRTH,
          status: DraftStatus.Draft,
          version: 1,
          history: draftHistory,
          updatedAt: Date.now(),
          createdAt: Date.now()
        }
        store.dispatch(updateFormConfig(newDraft))
        component.update()
      })

      const openOptionsMenu = () => {
        component
          .find('#draftActionsToggleButton')
          .hostNodes()
          .first()
          .simulate('click')
        component.update()
      }

      const selectMenuItem = (item: number) => {
        component.find(`#draftActionsItem${item}`).first().simulate('click')
        component.update()
      }

      it('should show options menu', () => {
        expect(component.exists('OptionsMenu')).toBeTruthy()
      })

      it('should show preview modal when clicked', () => {
        openOptionsMenu()
        selectMenuItem(0)
        expect(
          component.find('ActionsModal').find('ResponsiveModal').prop('show')
        ).toBeTruthy()
      })

      it('should show delete modal when clicked', () => {
        openOptionsMenu()
        selectMenuItem(1)
        expect(
          component.find('ActionsModal').find('ResponsiveModal').prop('show')
        ).toBeTruthy()
      })
    })
  })

  describe('when DraftStatus status is IN_PREVIEW', () => {
    const inPreviewDraft: IFormDraft = {
      event: Event.BIRTH,
      status: DraftStatus.InPreview,
      version: 1,
      history: draftHistory,
      updatedAt: Date.now(),
      createdAt: Date.now()
    }

    beforeEach(() => {
      store.dispatch(updateFormConfig(inPreviewDraft))
      component.update()
    })

    it('should show status Pill', () => {
      expect(component.exists('Pill')).toBeTruthy()
    })
  })

  describe('when DraftStatus status is PUBLISHED', () => {
    const publishedDraft: IFormDraft = {
      event: Event.BIRTH,
      status: DraftStatus.Published,
      version: 1,
      history: draftHistory,
      updatedAt: Date.now(),
      createdAt: Date.now()
    }

    beforeEach(() => {
      store.dispatch(updateFormConfig(publishedDraft))
      component.update()
    })

    it('should show status Pill', () => {
      expect(component.exists('Pill')).toBeTruthy()
    })
  })
})
