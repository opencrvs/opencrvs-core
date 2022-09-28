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
import { createTestComponent, createTestStore } from '@client/tests/util'
import { DownloadButton } from './DownloadButton'
import { AppStore } from '@client/store'
import { History } from 'history'
import * as React from 'react'
import { DownloadAction } from '@client/forms'
import { ReactWrapper } from 'enzyme'
import * as declarationReducer from '@client/declarations'
import { vi, SpyInstance } from 'vitest'

const { DOWNLOAD_STATUS } = declarationReducer

function getAssignmentModal(
  testComponent: ReactWrapper<{}, {}>
): ReactWrapper<{}, {}> {
  testComponent.simulate('click')
  testComponent.update()
  return testComponent.find('#assignment').hostNodes()
}

function clickOnModalAction(
  testComponent: ReactWrapper<{}, {}>,
  selector: string
) {
  const modal = getAssignmentModal(testComponent)
  const action = modal.find(selector).hostNodes()
  action.simulate('click')
  testComponent.update()
}

describe('download button tests', () => {
  let store: AppStore
  let history: History<unknown>
  let testComponent: ReactWrapper<{}, {}>
  let deleteSpy: SpyInstance
  let unassignSpy: SpyInstance

  describe('for download status downloaded', () => {
    describe('when assignment object is undefined in props', () => {
      beforeEach(async () => {
        deleteSpy = vi.spyOn(declarationReducer, 'deleteDeclaration')
        const testStore = await createTestStore()
        store = testStore.store
        history = testStore.history
        testComponent = await createTestComponent(
          <DownloadButton
            downloadConfigs={{
              event: 'birth',
              compositionId: '123',
              action: DownloadAction.LOAD_REVIEW_DECLARATION,
              assignment: undefined,
              declarationStatus: ''
            }}
            status={DOWNLOAD_STATUS.DOWNLOADED}
          />,
          { store, history }
        )
      })

      it('download button renders', () => {
        expect(testComponent).toBeDefined()
      })

      it('clicking download button pops up unassign modal', () => {
        const modal = getAssignmentModal(testComponent)
        expect(modal.text()).toContain('Unassign record?')
      })

      it('clicking on unassign button triggers deleteDeclaration action', () => {
        clickOnModalAction(testComponent, '#unassign')
        expect(deleteSpy).toBeCalledWith('123')
      })
    })
    describe('when assignment object is defined in props', () => {
      beforeEach(async () => {
        unassignSpy = vi.spyOn(declarationReducer, 'unassignDeclaration')
        const testStore = await createTestStore()
        store = testStore.store
        history = testStore.history
        testComponent = await createTestComponent(
          <DownloadButton
            downloadConfigs={{
              event: 'birth',
              compositionId: '123',
              action: DownloadAction.LOAD_REVIEW_DECLARATION,
              assignment: {
                firstName: 'Kennedy',
                lastName: 'Mweene',
                officeName: 'Ibombo District Office',
                userId: '456'
              },
              declarationStatus: ''
            }}
            status={DOWNLOAD_STATUS.DOWNLOADED}
          />,
          { store, history }
        )
      })

      it('download button renders', () => {
        expect(testComponent).toBeDefined()
      })

      it('clicking download button pops up unassign modal', () => {
        const modal = getAssignmentModal(testComponent)
        expect(modal.text()).toContain('Unassign record?')
      })

      it('clicking on unassign button triggers unassignDeclaration action', () => {
        clickOnModalAction(testComponent, '#unassign')
        expect(unassignSpy).toBeCalled()
      })
    })
  })
})
