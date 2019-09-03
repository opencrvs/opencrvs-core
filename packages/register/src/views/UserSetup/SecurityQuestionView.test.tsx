import { createStore } from '@register/store'
import {
  createTestComponent,
  flushPromises,
  selectOption
} from '@register/tests/util'
import { SecurityQuestion } from '@register/views/UserSetup/SecurityQuestionView'
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
