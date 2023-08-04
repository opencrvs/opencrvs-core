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
  registerScopeToken,
  primaryAddressData,
  primaryInternationalAddressLines,
  secondaryAddressData,
  secondaryInternationalAddressLines,
  eventAddressData,
  flushPromises,
  getFileFromBase64String,
  validImageB64String
} from '@client/tests/util'
import {
  DRAFT_BIRTH_PARENT_FORM,
  REVIEW_EVENT_PARENT_FORM_PAGE,
  REGISTRAR_HOME
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
import { Event } from '@client/utils/gateway'
import { v4 as uuid } from 'uuid'
// eslint-disable-next-line no-restricted-imports
import * as ReactApollo from '@apollo/client/react'
import { checkAuth } from '@opencrvs/client/src/profile/profileActions'
import { waitForElement } from '@client/tests/wait-for-element'
import {
  birthDraftData,
  birthReviewDraftData,
  deathReviewDraftData,
  marriageReviewDraftData
} from '@client/tests/mock-drafts'
import { vi } from 'vitest'

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

  describe('when user is in the death review section', () => {
    let customDraft: IDeclaration

    const registerScopeToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'

    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth())
      await flushPromises()
      const data = deathReviewDraftData

      customDraft = { id: uuid(), data, review: true, event: Event.Death }
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
      vi.doMock('@apollo/client/react', () => ({ default: ReactApollo }))
      app.update().find('#registerDeclarationBtn').hostNodes().simulate('click')
      app.update()
      app.update().find('#submit_confirm').hostNodes().simulate('click')
    })

    it('rejecting declaration redirects to reject confirmation screen', async () => {
      vi.doMock('@apollo/client/react', () => ({ default: ReactApollo }))

      app.find('#rejectDeclarationBtn').hostNodes().simulate('click')

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

      expect(history.location.pathname).toEqual(REGISTRAR_HOME)
    })
  })

  describe('when user is in the preview section', () => {
    let customDraft: IDeclaration

    beforeEach(async () => {
      const data = birthDraftData

      customDraft = {
        id: uuid(),
        data,
        event: Event.Birth,
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
            expect(history.location.pathname).toBe(REGISTRAR_HOME)
          })
        })
      })
    })
  })

  describe('when user is in the birth review section', () => {
    let customDraft: IDeclaration

    const childDetails: IPersonDetails = {
      attendantAtBirth: 'NURSE',
      childBirthDate: '1999-10-10',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'নাইম',
      firstNamesEng: 'Naim',
      gender: 'male',
      multipleBirth: '2',
      birthType: 'SINGLE',
      weightAtBirth: '6',
      _fhirID: '1'
    }

    const fatherDetails: IPersonDetails = {
      detailsExist: true,
      iD: '432432432',
      iDType: 'NATIONAL_ID',
      primaryAddressSameAsOtherPrimary: true,
      ...primaryAddressData,
      ...primaryInternationalAddressLines,
      ...secondaryAddressData,
      ...secondaryInternationalAddressLines,
      fatherBirthDate: '1999-10-10',
      dateOfMarriage: '2010-10-10',
      educationalAttainment: 'PRIMARY_ISCED_1',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'আনোয়ার',
      firstNamesEng: 'Anwar',
      maritalStatus: 'MARRIED',
      nationality: 'FAR',
      _fhirID: '2'
    }

    const motherDetails: IPersonDetails = {
      iD: '765987987',
      iDType: 'NATIONAL_ID',
      nationality: 'FAR',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'রোকেয়া',
      firstNamesEng: 'Rokeya',
      maritalStatus: 'MARRIED',
      dateOfMarriage: '2010-10-10',
      motherBirthDate: '1999-10-10',
      educationalAttainment: 'PRIMARY_ISCED_1',
      ...primaryAddressData,
      ...primaryInternationalAddressLines,
      ...secondaryAddressData,
      ...secondaryInternationalAddressLines,
      _fhirID: '3'
    }

    const registrationDetails = {
      contactPoint: {
        value: 'DAUGHTER',
        nestedFields: { registrationPhone: '0787878787' }
      },
      trackingId: 'B123456',
      registrationNumber: '2019121525B1234568',
      _fhirID: '4'
    }

    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      await store.dispatch(checkAuth())
      await flushPromises()
      const data = birthReviewDraftData

      customDraft = { id: uuid(), data, review: true, event: Event.Birth }
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
      vi.doMock('@apollo/client/react', () => ({ default: ReactApollo }))

      app.find('#rejectDeclarationBtn').hostNodes().simulate('click')

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

      expect(history.location.pathname).toEqual(REGISTRAR_HOME)
    })
  })

  describe('when user is in the marriage review section', () => {
    let customDraft: IDeclaration

    const registerScopeToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'

    beforeEach(async () => {
      getItem.mockReturnValue(registerScopeToken)
      store.dispatch(checkAuth())
      await flushPromises()
      const data = marriageReviewDraftData

      customDraft = { id: uuid(), data, review: true, event: Event.Marriage }
      store.dispatch(storeDeclaration(customDraft))
      history.replace(
        REVIEW_EVENT_PARENT_FORM_PAGE.replace(
          ':declarationId',
          customDraft.id.toString()
        )
          .replace(':event', 'marriage')
          .replace(':pageId', 'review')
      )
      await waitForElement(app, '#readyDeclaration')
    })

    it('successfully submits the review form', async () => {
      vi.doMock('@apollo/client/react', () => ({ default: ReactApollo }))
      app.update().find('#registerDeclarationBtn').hostNodes().simulate('click')
      app.update()
      app.find('#submit_confirm').hostNodes().simulate('click')
    })

    it('rejecting declaration redirects to reject confirmation screen', async () => {
      vi.doMock('@apollo/client/react', () => ({ default: ReactApollo }))

      app.find('#rejectDeclarationBtn').hostNodes().simulate('click')

      // app.find('#rejectionReasonduplicate').hostNodes().simulate('change')

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

      expect(history.location.pathname).toEqual(REGISTRAR_HOME)
    })
  })

  describe('when user has validate scope', () => {
    beforeEach(async () => {
      getItem.mockReturnValue(validateScopeToken)
      await store.dispatch(checkAuth())
      await flushPromises()
      const data = {
        _fhirIDMap: {
          composition: '16'
        },
        ...mockDeclarationData
      }

      const customDraft = createReviewDeclaration(uuid(), data, Event.Birth)
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
      expect(app.update().contains('#validateDeclarationBtn')).toBeFalsy()
    })
  })
})
