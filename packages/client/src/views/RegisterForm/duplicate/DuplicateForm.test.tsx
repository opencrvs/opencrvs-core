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
import { createDeclaration } from '@client/declarations'
import { Event as DeclarationEvent } from '@client/utils/gateway'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@client/navigation/routes'
import { createStore } from '@client/store'
import { createTestComponent, selectOption } from '@client/tests/util'
import { ReviewSection } from '@client/views/RegisterForm/review/ReviewSection'
import { ReactWrapper } from 'enzyme'
import { waitForElement } from '@client/tests/wait-for-element'
import { isMobileDevice } from '@client/utils/commonUtils'
import { vi, Mock, SpyInstance } from 'vitest'

const { store, history } = createStore()
const mockHandler = vi.fn()

const draft = createDeclaration(DeclarationEvent.Birth)
draft.data = {
  child: { firstNamesEng: 'John', familyNameEng: 'Doe' },
  father: {
    detailsExist: true
  },
  mother: {
    detailsExist: true
  },
  documents: {
    imageUploader: { title: 'dummy', description: 'dummy', data: '' }
  },
  registration: {
    commentsOrNotes: '',
    type: 'birth'
  }
}
//@ts-ignore
draft.duplicates = [
  {
    compositionId: 'd5a36e6f-2ba2-4f86-a83a-8bc9dbb5d655',
    trackingId: 'BK7VQ0U',
    __typename: 'DuplicatesInfo'
  }
]

describe('when in device of large viewport', () => {
  let userAgentMock: SpyInstance

  beforeEach(() => {
    userAgentMock = vi.spyOn(window.navigator, 'userAgent', 'get')
    Object.assign(window, { outerWidth: 1034 })

    userAgentMock.mockReturnValue('Desktop')
    ;(isMobileDevice as Mock).mockRestore()
  })

  describe('when user is in the review page', () => {
    let duplicateFormComponent: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <ReviewSection
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
          draft={draft}
          rejectDeclarationClickEvent={mockHandler}
          submitClickEvent={mockHandler}
          onChangeReviewForm={mockHandler}
        />,
        { store, history }
      )
      duplicateFormComponent = testComponent
      await waitForElement(duplicateFormComponent, '#review_header')
    })

    it('renders header component', () => {
      expect(
        duplicateFormComponent.find('#content-name').hostNodes().text()
      ).toBe('Is John Doe (undefined) a duplicate?')
    })

    describe('mark as a duplicate button test', () => {
      it('mark a duplicate button clicked', async () => {
        duplicateFormComponent
          .find('#mark-as-duplicate')
          .hostNodes()
          .first()
          .simulate('click')
        expect(
          duplicateFormComponent.find('#mark-as-duplicate-modal').hostNodes()
        ).toHaveLength(1)
      })
      it('disable the duplicate button on modal initially', async () => {
        duplicateFormComponent
          .find('#mark-as-duplicate')
          .hostNodes()
          .first()
          .simulate('click')
        expect(
          duplicateFormComponent
            .find('#mark-as-duplicate-button')
            .hostNodes()
            .props().disabled
        ).toBeTruthy()
      })
      it('enable the duplicate button on modal when select duplicate Id', async () => {
        duplicateFormComponent
          .find('#mark-as-duplicate')
          .hostNodes()
          .first()
          .simulate('click')
        selectOption(duplicateFormComponent, '#selectTrackingId', 'BK7VQ0U')
        expect(
          duplicateFormComponent
            .find('#mark-as-duplicate-button')
            .hostNodes()
            .props().disabled
        ).toBeFalsy()
      })
    })

    describe('mark not a duplicate button test', () => {
      it('mark not a duplicate button clicked', async () => {
        duplicateFormComponent
          .find('#not-a-duplicate')
          .hostNodes()
          .first()
          .simulate('click')
        expect(
          duplicateFormComponent.find('#not-duplicate-modal').hostNodes()
        ).toHaveLength(1)
      })
    })
  })
})
