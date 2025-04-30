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
  mockDeclarationData,
  createTestApp,
  flushPromises,
  setScopes,
  waitForReady,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { ReviewSection } from '@client/forms'
import { SCOPES } from '@opencrvs/commons/client'
import { EventType, RegStatus } from '@client/utils/gateway'
import {
  IDeclaration,
  storeDeclaration,
  modifyDeclaration,
  createReviewDeclaration
} from '@client/declarations'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { Store } from 'redux'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { waitForElement } from '@client/tests/wait-for-element'

let wrapper: ReactWrapper
let store: Store
let router: TestComponentWithRouteMock['router']

const declaration: IDeclaration = createReviewDeclaration(
  '72c18939-70c1-40b4-9b80-b162c4871160',
  mockDeclarationData,
  EventType.Birth,
  RegStatus.Registered
)

declaration.data.mother = {
  ...declaration.data.mother,
  iD: '123456789'
}

declaration.data.registration = {
  ...declaration.data.registration,
  informantType: {
    value: 'MOTHER',
    nestedFields: { otherInformantType: '' }
  },
  contactPoint: {
    value: 'MOTHER',
    nestedFields: { registrationPhone: '01733333333' }
  }
}

describe('Review form for an declaration', () => {
  beforeEach(async () => {
    await flushPromises()

    const appBundle = await createTestApp(undefined, [
      formatUrl(CERTIFICATE_CORRECTION_REVIEW, {
        declarationId: declaration.id,
        pageId: ReviewSection.Review,
        groupId: 'review-view-group'
      })
    ])

    wrapper = appBundle.app
    store = appBundle.store
    router = appBundle.router

    setScopes([SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION], store)
    await waitForReady(wrapper)
    store.dispatch(storeDeclaration(declaration))

    await flushPromises()
    router.navigate(
      formatUrl(CERTIFICATE_CORRECTION_REVIEW, {
        declarationId: declaration.id,
        pageId: ReviewSection.Review,
        groupId: 'review-view-group'
      }),
      { replace: true }
    )

    await waitForElement(wrapper, 'CorrectionReviewFormComponent')
  })

  it('should disable the continue button if there is an error', () => {
    store.dispatch(
      modifyDeclaration({
        ...declaration,
        data: {
          ...declaration.data,
          child: {}
        }
      })
    )
    wrapper.update()

    expect(
      wrapper.find('#continue_button').hostNodes().props().disabled
    ).toBeTruthy()
  })

  it('should cancel the correction when the cross button is pressed', async () => {
    await waitForElement(wrapper, '#exit-btn')

    wrapper.find('#exit-btn').hostNodes().simulate('click')
    wrapper.update()

    expect(router.state.location.pathname).toContain(WORKQUEUE_TABS.inProgress)
  })

  it('should disable the continue button if no changes have been made', async () => {
    await waitForElement(wrapper, '#continue_button')
    expect(
      wrapper.find('#continue_button').hostNodes().props().disabled
    ).toBeTruthy()
  })

  it('should not disable the continue button if changes have been made', async () => {
    store.dispatch(
      modifyDeclaration({
        ...declaration,
        data: {
          ...declaration.data,
          mother: {
            ...declaration.data.mother,
            iD: '1231313222'
          }
        }
      })
    )
    wrapper.update()
    await waitForElement(wrapper, '#continue_button')
    await flushPromises()

    expect(
      wrapper.find('#continue_button').hostNodes().props().disabled
    ).toBeFalsy()
  })

  it('should go to supporting documents form when continue is pressed', async () => {
    store.dispatch(
      modifyDeclaration({
        ...declaration,
        data: {
          ...declaration.data,
          mother: {
            ...declaration.data.mother,
            iD: '122456789'
          }
        }
      })
    )
    wrapper.update()
    await waitForElement(wrapper, '#continue_button')
    wrapper.find('#continue_button').hostNodes().simulate('click')
    wrapper.update()

    expect(router.state.location.pathname).toContain('/supportingDocuments')
  })
})
