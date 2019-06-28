import * as React from 'react'
import { createTestComponent, userDetails } from '@register/tests/util'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { createStore } from '@register/store'
import { UserSetupReview, activateUserMutation } from './SetupReviewPage'
import { merge } from 'lodash'
import { DataRow } from '@opencrvs/components/lib/interface'

const { store } = createStore()

describe('SetupReviewPage page tests', async () => {
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
  })
  it('render page', async () => {
    store.dispatch(
      getStorageUserDetailsSuccess(
        JSON.stringify({ ...userDetails, type: 'CHA' })
      )
    )
    const testComponent = createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
        goToStep={() => {}}
      />,
      store
    )

    expect(testComponent.component.find('#UserSetupData')).toBeDefined()
    testComponent.component.unmount()
  })
  it('render page without type', async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    const testComponent = createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
        goToStep={() => {}}
      />,
      store
    )

    const role = testComponent.component
      .find('#RoleType')
      .hostNodes()
      .childAt(0)
      .childAt(0)
      .childAt(1)
      .text()
    expect(role).toEqual('Field Agent')
    testComponent.component.unmount()
  })
  it('clicks question to change', async () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
        goToStep={() => {}}
      />,
      store
    )

    testComponent.component
      .find('#Question_Action_BIRTH_TOWN')
      .hostNodes()
      .simulate('click')

    testComponent.component.unmount()
  })
  it('submit user setup for activation', async () => {
    const mock = [
      {
        request: {
          query: activateUserMutation,
          variables: {
            userId: 'ba7022f0ff4822',
            password: 'password',
            securityQuestionAnswers: [
              { questionKey: 'BIRTH_TOWN', answer: 'test' }
            ]
          }
        },
        result: {
          data: []
        }
      }
    ]
    const testComponent = createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
      />,
      store,
      mock
    )

    testComponent.component.find('button#Confirm').simulate('click')

    testComponent.component.unmount()
  })

  it('it shows error if error occurs', async () => {
    const graphqlErrorMock = [
      {
        request: {
          query: activateUserMutation,
          variables: {
            userId: 'ba7022f0ff4822',
            password: 'password',
            securityQuestionAnswers: [
              { questionKey: 'BIRTH_TOWN', answer: 'test' }
            ]
          }
        },
        error: new Error('boom!')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
      />,
      store,
      graphqlErrorMock
    )

    testComponent.component.find('button#Confirm').simulate('click')

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    expect(
      testComponent.component
        .find('#GlobalError')
        .hostNodes()
        .text()
    ).toBe('An error occured. Please try again.')

    testComponent.component.unmount()
  })
})
