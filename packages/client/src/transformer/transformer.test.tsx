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
import {
  createTestApp,
  mockOfflineData,
  validToken,
  getItem,
  flushPromises,
  setItem
} from '@client/tests/util'
import { DRAFT_BIRTH_PARENT_FORM } from '@client/navigation/routes'
import {
  storeDeclaration,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { v4 as uuid } from 'uuid'
import { draftToGqlTransformer } from '@client/transformer'
import { getRegisterForm } from '@opencrvs/client/src/forms/register/declaration-selectors'
import { getOfflineDataSuccess } from '@client/offline/actions'
import { IForm } from '@opencrvs/client/src/forms'
import { Event } from '@client/utils/gateway'
import { clone } from 'lodash'
import { birthDraftData } from '@client/tests/mock-drafts'
import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'

const fetch = createFetchMock(vi)
fetch.enableMocks()

interface IPersonDetails {
  [key: string]: any
}

describe('when draft data is transformed to graphql', () => {
  let app: ReactWrapper
  let history: History
  let store: Store
  let customDraft: IDeclaration
  let form: IForm

  beforeEach(async () => {
    getItem.mockReturnValue(validToken)
    setItem.mockClear()
    fetch.resetMocks()
    fetch.mockResponses(
      [JSON.stringify({ data: mockOfflineData.locations }), { status: 200 }],
      [JSON.stringify({ data: mockOfflineData.facilities }), { status: 200 }]
    )
    const testApp = await createTestApp()
    app = testApp.app
    await flushPromises()
    app.update()
    history = testApp.history
    store = testApp.store
    store.dispatch(getOfflineDataSuccess(JSON.stringify(mockOfflineData)))

    customDraft = {
      id: uuid(),
      data: birthDraftData,
      event: Event.Birth,
      submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    }
    store.dispatch(storeDeclaration(customDraft))
    form = getRegisterForm(store.getState())[Event.Birth]
    history.replace(
      DRAFT_BIRTH_PARENT_FORM.replace(
        ':declarationId',
        customDraft.id.toString()
      )
    )

    app.update()
  })

  describe('when user is in birth registration by parent informant view', () => {
    it('Check if new place of birth location address is parsed properly', () => {
      const clonedChild = clone(birthDraftData.child)
      clonedChild.placeOfBirth = 'PRIVATE_HOME'
      clonedChild.countryPlaceofbirth = 'BGD'
      clonedChild.districtPlaceofbirth = 'district'
      clonedChild.statePlaceofbirth = 'state'
      const data = {
        child: clonedChild,
        father: birthDraftData.father,
        mother: birthDraftData.mother,
        registration: birthDraftData.registration,
        documents: { imageUploader: '' }
      }

      expect(
        draftToGqlTransformer(
          form,
          data,
          '9633042c-ca34-4b9f-959b-9d16909fd85c'
        ).eventLocation.type
      ).toBe('PRIVATE_HOME')
    })
    it('Pass false as detailsExist on father section', () => {
      const data = {
        child: birthDraftData.child,
        father: {
          detailsExist: false
        },
        mother: birthDraftData.mother,
        registration: birthDraftData.registration,
        documents: { imageUploader: '' }
      }

      expect(draftToGqlTransformer(form, data).father).toEqual({
        detailsExist: false
      })
      expect(
        draftToGqlTransformer(form, data).registration.inCompleteFields
      ).toContain('father/father-view-group/reasonNotApplying')
    })
    it('Sends inCompleteFields if in-complete data is given', () => {
      const data = {
        child: {},
        father: {},
        mother: {},
        registration: birthDraftData.registration,
        documents: {}
      }
      expect(
        draftToGqlTransformer(form, data).registration.inCompleteFields
      ).toContain('child/child-view-group/placeOfBirth')
    })
    it('Sends inCompleteFields when registration data is also missing', () => {
      const data = {
        child: {},
        father: {},
        mother: {},
        documents: {},
        registration: {}
      }
      expect(
        draftToGqlTransformer(form, data).registration.inCompleteFields
      ).toBeDefined()
    })
  })
})
