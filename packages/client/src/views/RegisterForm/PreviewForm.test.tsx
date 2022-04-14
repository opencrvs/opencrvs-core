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
import {
  createTestApp,
  getItem,
  mockDeclarationData,
  goToEndOfForm,
  waitForReady,
  validateScopeToken,
  registerScopeToken
} from '@client/tests/util'
import {
  DRAFT_BIRTH_PARENT_FORM,
  REVIEW_EVENT_PARENT_FORM_PAGE,
  HOME
} from '@client/navigation/routes'
import {
  storeDeclaration,
  IDeclaration,
  SUBMISSION_STATUS,
  createReviewDeclaration
} from '@client/declarations'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'

import { Event } from '@client/forms'
import { v4 as uuid } from 'uuid'
// eslint-disable-next-line no-restricted-imports
import * as ReactApollo from 'react-apollo'
import { checkAuth } from '@opencrvs/client/src/profile/profileActions'

import { waitForElement, waitForSeconds } from '@client/tests/wait-for-element'
import {
  birthDraftData,
  birthReviewDraftData,
  deathReviewDraftData
} from '@client/tests/mock-drafts'

interface IPersonDetails {
  [key: string]: any
}

describe('when user is previewing the form data', () => {
  let app: ReactWrapper
  let history: History
  let store: Store

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store
    await waitForReady(app)
  })

  describe('when user is in the preview section', () => {
    let customDraft: IDeclaration

    beforeEach(async () => {
      const data = birthDraftData

      customDraft = {
        id: uuid(),
        data,
        event: Event.BIRTH,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      }
      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(
          ':declarationId',
          customDraft.id.toString()
        )
      )

      await waitForElement(app, '#readyDeclaration')
    })

    describe('when user clicks the "submit" button', () => {
      beforeEach(async () => {
        await goToEndOfForm(app)
      })

      it('check whether submit button is enabled or not', async () => {
        expect(app.find('#submit_form').hostNodes().prop('disabled')).toBe(
          false
        )
      })
      describe('All sections visited', () => {
        it('Should be able to click SEND FOR REVIEW Button', () => {
          expect(app.find('#submit_form').hostNodes().prop('disabled')).toBe(
            false
          )
        })
        describe('button clicked', () => {
          beforeEach(async () => {
            app.find('#submit_form').hostNodes().simulate('click')
          })

          it('confirmation screen should show up', () => {
            expect(app.find('#submit_confirm').hostNodes()).toHaveLength(1)
          })
          it('should redirect to home page', () => {
            app.find('#submit_confirm').hostNodes().simulate('click')
            expect(history.location.pathname).toBe(HOME)
          })
        })
      })
    })
  })
  describe('when user is in the birth review section', () => {
    let customDraft: IDeclaration
    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      await store.dispatch(checkAuth({ '?token': registerScopeToken }))
      const data = birthReviewDraftData

      customDraft = { id: uuid(), data, review: true, event: Event.BIRTH }
      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':declarationId',
          customDraft.id.toString()
        )
          .replace(':event', 'birth')
          .replace(':pageId', 'review')
      )
      await waitForElement(app, '#readyDeclaration')
    })

    it('rejecting declaration redirects to home screen', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })

      app.find('#rejectDeclarationBtn').hostNodes().simulate('click')

      app.find('#rejectionReasonmisspelling').hostNodes().simulate('change')

      app
        .find('#rejectionCommentForHealthWorker')
        .hostNodes()
        .simulate('change', {
          target: {
            id: 'rejectionCommentForHealthWorker',
            value: 'reject reason'
          }
        })

      app.find('#submit_reject_form').hostNodes().simulate('click')

      expect(history.location.pathname).toEqual('/')
    })
  })
  describe('when user is in the death review section', () => {
    let customDraft: IDeclaration

    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      await store.dispatch(checkAuth({ '?token': registerScopeToken }))
      const data = deathReviewDraftData

      customDraft = { id: uuid(), data, review: true, event: Event.DEATH }
      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':declarationId',
          customDraft.id.toString()
        )
          .replace(':event', 'death')
          .replace(':pageId', 'review')
      )
      await waitForElement(app, '#readyDeclaration')
    })

    it('successfully submits the review form', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })
      app.update().find('#registerDeclarationBtn').hostNodes().simulate('click')
      app.update().find('#submit_confirm').hostNodes().simulate('click')
    })

    it('rejecting declaration redirects to reject confirmation screen', async () => {
      jest.setMock('react-apollo', { default: ReactApollo })

      app.find('#rejectDeclarationBtn').hostNodes().simulate('click')

      app.find('#rejectionReasonmisspelling').hostNodes().simulate('change')

      app
        .find('#rejectionCommentForHealthWorker')
        .hostNodes()
        .simulate('change', {
          target: {
            id: 'rejectionCommentForHealthWorker',
            value: 'reject reason'
          }
        })

      app.find('#submit_reject_form').hostNodes().simulate('click')

      expect(history.location.pathname).toEqual('/')
    })
  })

  describe('when user has validate scope', () => {
    beforeEach(async () => {
      getItem.mockReturnValue(validateScopeToken)
      await store.dispatch(checkAuth({ '?token': validateScopeToken }))
      const data = {
        _fhirIDMap: {
          composition: '16'
        },
        ...mockDeclarationData
      }

      const customDraft = createReviewDeclaration(uuid(), data, Event.BIRTH)
      customDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]

      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':declarationId',
          customDraft.id.toString()
        )
          .replace(':event', 'birth')
          .replace(':pageId', 'review')
      )
      app.update()
    })

    it('shows send for review button', async () => {
      await waitForElement(app, '#readyDeclaration')

      expect(
        app.update().find('#validateDeclarationBtn').hostNodes().text()
      ).toBe('Send For Approval')
    })
  })
})
