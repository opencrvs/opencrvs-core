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
import * as React from 'react'
import { createTestComponent, userDetails } from '@client/tests/util'
import { getStorageUserDetailsSuccess } from '@opencrvs/client/src/profile/profileActions'
import { createStore } from '@client/store'
import { UserSetupReview } from './SetupReviewPage'
import { activateUserMutation } from './queries'

const { store, history } = createStore()

describe('SetupReviewPage page tests', () => {
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
  })
  it('render page', async () => {
    store.dispatch(
      getStorageUserDetailsSuccess(
        JSON.stringify({ ...userDetails, type: 'CHA' })
      )
    )
    const testComponent = await createTestComponent(
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
      { store, history }
    )

    expect(testComponent.find('#UserSetupData')).toBeDefined()
  })
  it('render page without type', async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    const testComponent = await createTestComponent(
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
      { store, history }
    )
    const role = testComponent.find('#RoleType_value').hostNodes().text()
    expect(role).toEqual('Field Agent')
  })
  it('clicks question to change', async () => {
    const testComponent = await createTestComponent(
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
      { store, history }
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
    const testComponent = await createTestComponent(
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
      { store, history, graphqlMocks: mock }
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

    const testComponent = await createTestComponent(
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
      { store, history, graphqlMocks: graphqlErrorMock }
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

  it('shows nothing for undefined fields of userDetails', async () => {
    store.dispatch(
      getStorageUserDetailsSuccess(
        JSON.stringify({
          catchmentArea: [
            {
              id: '850f50f3-2ed4-4ae6-b427-2d894d4a3329',
              name: 'Dhaka',
              status: 'active',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/geo-id',
                  value: '3'
                },
                {
                  system: 'http://opencrvs.org/specs/id/bbs-code',
                  value: '30'
                },
                {
                  system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                  value: 'DIVISION'
                }
              ]
            }
          ]
        })
      )
    )

    const testComponent = await createTestComponent(
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
      { store, history }
    )

    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.update()

    expect(testComponent.find('div#EnglishName').hostNodes().text()).toBe(
      'English nameChange'
    )
    expect(testComponent.find('div#UserPhone').hostNodes().text()).toBe(
      'Phone numberChange'
    )
  })
})
