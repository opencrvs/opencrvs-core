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
import {
  draftToGqlTransformer,
  gqlToDraftTransformer
} from '@client/transformer'
import { getRegisterForm } from '@opencrvs/client/src/forms/register/declaration-selectors'
import { getOfflineDataSuccess } from '@client/offline/actions'
import { Event, IForm } from '@opencrvs/client/src/forms'
import { clone } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'
import { birthDraftData } from '@client/tests/mock-drafts'

const fetch = fetchAny as any

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
      event: Event.BIRTH,
      submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    }
    store.dispatch(storeDeclaration(customDraft))
    form = getRegisterForm(store.getState())[Event.BIRTH]
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
      clonedChild.country = 'BGD'
      clonedChild.district = 'district'
      clonedChild.state = 'state'
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
    it('Check if contactNumber is found properly', () => {
      expect(
        draftToGqlTransformer(form, birthDraftData).registration
          .contactPhoneNumber
      ).toBe('+8801733333333')
    })
    it('Pass false as detailsExist on father section', () => {
      const clonedFather = clone(birthDraftData.father)
      clonedFather.detailsExist = false

      const data = {
        child: birthDraftData.child,
        father: clonedFather,
        mother: birthDraftData.mother,
        registration: birthDraftData.registration,
        documents: { imageUploader: '' }
      }

      expect(draftToGqlTransformer(form, data).father).toEqual({
        detailsExist: false
      })
      expect(
        draftToGqlTransformer(form, data).registration.inCompleteFields
      ).toEqual('father/father-view-group/reasonNotApplying')
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

    it('transform gql data from form correction data', () => {
      const data = {
        child: birthDraftData.child,
        father: birthDraftData.father,
        mother: birthDraftData.mother,
        registration: {
          commentsOrNotes: 'comments',
          registrationCertificateLanguage: ['en'],
          informantType: {
            value: 'FATHER',
            nestedFields: { otherInformantType: '' }
          },
          contactPoint: {
            value: 'FATHER',
            nestedFields: { registrationPhone: '01736478896' }
          }
        },
        documents: { imageUploader: '' }
      }

      const originalData = birthDraftData

      const transformedCorrectionData = {
        values: [
          {
            fieldName: 'informantType',
            newValue: 'FATHER',
            oldValue: 'MOTHER',
            section: 'registration'
          },
          {
            fieldName: 'contactPoint',
            newValue: 'FATHER',
            oldValue: 'MOTHER',
            section: 'registration'
          },
          {
            fieldName: 'contactPoint.nestedFields.registrationPhone',
            newValue: '01736478896',
            oldValue: '01733333333',
            section: 'registration'
          }
        ]
      }

      expect(
        draftToGqlTransformer(
          form,
          data,
          '9633042c-ca34-4b9f-959b-9d16909fd85c',
          originalData
        ).registration.correction
      ).toEqual(transformedCorrectionData)
    })
  })
})
