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
import { checkAuth } from '@client/profile/profileActions'
import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import { createTestComponent, mockUserResponse } from '@client/tests/util'
import { createClient } from '@client/utils/apolloClient'
import { merge } from 'lodash'
import * as React from 'react'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { vi, Mock } from 'vitest'
import { OIDPVerificationCallback } from './OIDPVerificationCallback'
import { URLSearchParams } from 'url'
import { useQueryParams, useExtractCallBackState, useCheckNonce } from './utils'
import { GET_OIDP_USER_INFO } from './queries'
import { createDeclaration, storeDeclaration } from '@client/declarations'
import { Event } from '@client/utils/gateway'

const draft = createDeclaration(Event.Birth)
draft.data.mother = {}

const mockFetchUserDetails = vi.fn()

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as Mock
const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: {
        _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
        labels: [
          {
            lang: 'en',
            label: 'DISTRICT_REGISTRAR'
          }
        ]
      }
    }
  }
}

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails
storage.getItem = vi.fn()
storage.setItem = vi.fn()

// Define the mock query

const graphqlMocks = [
  {
    request: {
      query: GET_OIDP_USER_INFO,
      variables: {
        code: '1234',
        clientId: '7b621732-6c1d-4808-81b2-fd67f05f3af3',
        redirectUri: 'http://localhost:3000/mosip-callback'
      }
    },
    result: {
      data: {
        getOIDPUserInfo: {
          oidpUserInfo: {
            sub: '123',
            name: 'John Doe',
            given_name: 'John',
            family_name: 'Doe',
            middle_name: null,
            nickname: null,
            preferred_username: 'jdoe',
            profile: 'https://example.com/profile',
            picture: 'https://example.com/picture.jpg',
            website: 'https://example.com',
            email: 'jdoe@example.com',
            email_verified: true,
            gender: 'male',
            birthdate: '1980-01-01',
            zoneinfo: 'America/Los_Angeles',
            locale: 'en-US',
            phone_number: '+1-123-456-7890',
            phone_number_verified: true,
            address: {
              formatted: '123 Main St\nSan Francisco, CA 94105\nUSA',
              street_address: '123 Main St',
              locality: 'San Francisco',
              region: 'CA',
              postal_code: '94105',
              country: 'USA'
            },
            updated_at: '2023-03-30T10:00:00Z'
          },
          districtFhirId: '12345',
          stateFhirId: '67890'
        }
      }
    }
  }
]

let { store, history } = createStore()
let client = createClient(store)
beforeEach(async () => {
  ;({ store, history } = createStore())
  client = createClient(store)
  getItem.mockReturnValue(registerScopeToken)
  getItem.mockReturnValue('ea02388')
  ;(useExtractCallBackState as Mock).mockImplementation(() => ({
    pathname: 'http://localhost:3000/mosip-callback',
    section: 'mother',
    declarationId: draft.id
  }))
  ;(useQueryParams as Mock).mockImplementation(
    () => new URLSearchParams({ code: '1234' })
  )
  ;(useCheckNonce as Mock).mockImplementation(() => true)

  await store.dispatch(checkAuth())
  await store.dispatch(storeDeclaration(draft))
})

describe('Nid Verfication Callback page', () => {
  it('When nid user is successfully fetched', async () => {
    const testComponent = await createTestComponent(
      <OIDPVerificationCallback />,
      { store, history, graphqlMocks: graphqlMocks }
    )
    await waitFor(() => testComponent.find('#authenticating-label').length > 0)

    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    const declaration = store
      .getState()
      .declarationsState.declarations.find((d) => d.id === draft.id)
    expect(declaration?.data.mother.firstNamesEng).toBe('John')
  })

  it('When nid user info fetch has failed', async () => {
    const testComponent = await createTestComponent(
      <OIDPVerificationCallback />,
      { store, history }
    )

    await waitForElement(testComponent, '#authentication-failed-label')
  })
})
