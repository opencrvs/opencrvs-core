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
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { RejectRegistrationForm } from '@opencrvs/client/src/components/review/RejectRegistrationForm'
import { Event } from '@client/utils/gateway'
import { createDeclaration } from '@client/declarations'
import { vi } from 'vitest'

const { store, history } = createStore()
const mockHandler = vi.fn()

describe('reject registration form', () => {
  let component: ReactWrapper<{}, {}>
  const draftDeclaration = createDeclaration(Event.Birth)
  beforeEach(async () => {
    component = await createTestComponent(
      <RejectRegistrationForm
        onClose={mockHandler}
        duplicate={true}
        confirmRejectionEvent={mockHandler}
        declaration={draftDeclaration}
        draftId="04ba2b0e-ba38-4049-ad74-332e4ee9fbfe"
        event={Event.Birth}
      />,
      { store, history }
    )
  })

  it('renders form', () => {
    expect(component.find('#submit_reject_form').hostNodes()).toHaveLength(1)
  })

  it('renders form with submit button disabled', () => {
    expect(
      component.find('#submit_reject_form').hostNodes().prop('disabled')
    ).toEqual(true)
  })

  it('enables submit button when form is complete', () => {
    component
      .find('#rejectionReasonduplicate')
      .hostNodes()
      .simulate('change', { checked: false })

    component
      .find('#rejectionCommentForHealthWorker')
      .hostNodes()
      .simulate('change', {
        target: { name: 'rejectionCommentForHealthWorker', value: 'test' }
      })

    expect(
      component.find('#submit_reject_form').hostNodes().prop('disabled')
    ).toEqual(false)
  })
})
