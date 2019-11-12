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
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  selectOption
} from '@client/tests/util'
import { SecurityQuestion } from '@client/views/UserSetup/SecurityQuestionView'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'

const { store } = createStore()

describe('Security Question Page', () => {
  let component: ReactWrapper
  beforeEach(async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <SecurityQuestion setupData={{ securityQuestionAnswers: [] }} />,
      store
    )
    component = testComponent.component
    component.find('button#submit-security-question').simulate('click')
  })

  it('Should display the validation error messages when Contrinue button is pressed', () => {
    const questionElem = component
      .find('#question-0-validation-message')
      .hostNodes()
    const answerElem = component
      .find('#answer-0-validation-message')
      .hostNodes()

    expect(questionElem.text()).toBe('Select a security question')
    expect(answerElem.text()).toBe(
      'Enter a response to your chosen security question'
    )
  })

  it('Should remove the validation message', async () => {
    selectOption(component, '#question-0', 'What city were you born in?')
    component
      .find('#answer-0')
      .hostNodes()
      .simulate('change', { target: { value: 'Dhaka' } })

    await flushPromises()
    component.update()

    const quesValMsgElem = component
      .find('#question-0-validation-message')
      .hostNodes()
    const ansValMsgElem = component
      .find('#answer-0-validation-message')
      .hostNodes()

    expect(quesValMsgElem.length).toBe(0)
    expect(ansValMsgElem.length).toBe(0)
  })
})
