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
import { createStore } from '@client/store'
import { createTestComponent, userDetails } from '@client/tests/util'
import { getStorageUserDetailsSuccess } from '@opencrvs/client/src/profile/profileActions'
import * as React from 'react'
import { UserSetupReview } from './SetupReviewPage'
import { activateUserMutation } from './queries'

const { store } = createStore()

describe('SetupReviewPage page tests', () => {
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
  })
  it('render page', async () => {
    store.dispatch(
      getStorageUserDetailsSuccess(
        JSON.stringify({
          ...userDetails,
          role: {
            id: 'ENTREPRENEUR',
            label: {
              defaultMessage: 'Entrepreneur',
              description: 'Name for user role Entrepreneur',
              id: 'userRole.entrepreneur'
            }
          }
        })
      )
    )
    const { component: testComponent } = await createTestComponent(
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
      { store }
    )

    expect(testComponent.find('#UserSetupData')).toBeDefined()
  })
  it('render page without type', async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    const { component: testComponent } = await createTestComponent(
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
      { store }
    )
    const role = testComponent.find('#Role_value').hostNodes().text()
    expect(role).toEqual('Field Agent')
  })
  it('clicks question to change', async () => {
    const { component: testComponent } = await createTestComponent(
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
      { store }
    )

    testComponent
      .find('#Question_Action_BIRTH_TOWN')
      .hostNodes()
      .simulate('click')
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
    const { component: testComponent } = await createTestComponent(
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
      { store, graphqlMocks: mock }
    )

    testComponent.find('button#Confirm').simulate('click')
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

    const { component: testComponent } = await createTestComponent(
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
      { store, graphqlMocks: graphqlErrorMock }
    )

    testComponent.find('button#Confirm').simulate('click')

    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.update()
    expect(testComponent.find('#GlobalError').hostNodes().text()).toBe(
      'An error occurred. Please try again.'
    )
  })
})
