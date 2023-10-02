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
import {
  createTestComponent,
  createRouterProps,
  flushPromises,
  userDetails
} from '@client/tests/util'
import { AdvancedSearchResult } from './AdvancedSearchResult'
import { AppStore, createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import { formatUrl } from '@client/navigation'
import { ADVANCED_SEARCH_RESULT } from '@client/navigation/routes'
import { SEARCH_EVENTS } from '@client/search/queries'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { advancedSearchInitialState } from '@client/search/advancedSearch/reducer'
import {
  BOOKMARK_ADVANCED_SEARCH_RESULT_MUTATION,
  REMOVE_ADVANCED_SEARCH_RESULT_BOOKMARK_MUTATION
} from '@client/profile/mutations'
import { getStorageUserDetailsSuccess } from '@client/profile/profileActions'

const graphqlMock = [
  {
    request: {
      operationName: null,
      query: SEARCH_EVENTS,
      variables: {
        advancedSearchParameters: {
          event: 'death',
          registrationStatuses: ['IN_PROGRESS'],
          deceasedFirstNames: 'Iliyas'
        },
        count: 10,
        skip: 0
      }
    },
    result: {
      data: {
        searchEvents: {
          totalItems: 1,
          results: [
            {
              id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
              type: 'Death',
              __typename: 'X',
              registration: {
                __typename: 'X',
                status: 'DECLARED',
                trackingId: 'DW0UTHR',
                registrationNumber: null,
                duplicates: [],
                registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
              },
              dateOfDeath: '2007-01-01',
              deceasedName: [
                {
                  __typename: 'X',
                  firstNames: 'Iliyas',
                  familyName: 'Khan'
                },
                {
                  __typename: 'X',
                  firstNames: 'ইলিয়াস',
                  familyName: 'খান'
                }
              ],

              // TODO: When fragmentMatching work is completed, remove unnecessary result objects
              // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
              dateOfBirth: '',
              childName: []
            }
          ],
          __typename: 'EventSearchResultSet'
        }
      }
    }
  },
  {
    request: {
      query: BOOKMARK_ADVANCED_SEARCH_RESULT_MUTATION,
      variables: {
        bookmarkSearchInput: {
          userId: '123',
          name: 'Death Search',
          parameters: {
            event: 'death',
            registrationStatuses: ['IN_PROGRESS'],
            deceasedFirstNames: 'Iliyas'
          }
        }
      }
    },
    result: {
      data: {
        bookmarkAdvancedSearch: {
          searchList: [
            {
              name: 'New Query',
              searchId: 'c3ff3952-c137-4a82-8cde-d052885b9654',
              __typename: 'BookmarkedSeachItem',
              parameters: {
                event: 'death'
              }
            }
          ]
        }
      }
    }
  },
  {
    request: {
      query: REMOVE_ADVANCED_SEARCH_RESULT_BOOKMARK_MUTATION,
      variables: {
        removeBookmarkedSearchInput: {
          userId: '123',
          searchId: '1321356'
        }
      }
    },
    result: {
      data: {
        removeBookmarkedAdvancedSearch: {
          searchList: []
        }
      }
    }
  }
]

describe('AdvancedSearchResult Bookmark', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History

  beforeEach(async () => {
    const s = createStore()
    store = s.store
    history = s.history
    component = await createTestComponent(
      // @ts-ignore
      <AdvancedSearchResult
        {...createRouterProps(formatUrl(ADVANCED_SEARCH_RESULT, {}), {
          isNavigatedInsideApp: false
        })}
      />,
      {
        store,
        history,
        graphqlMocks: graphqlMock as any
      }
    )

    await flushPromises()
    component.update()
    store.dispatch(
      setAdvancedSearchParam({
        ...advancedSearchInitialState,
        event: 'death',
        deceasedFirstNames: 'Iliyas',
        registrationStatuses: ['IN_PROGRESS']
      })
    )
    component.update()
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    component.update()
    await waitForElement(component, 'AdvancedSearchResultComp')
  })

  it('AdvancedSearchResultComp page loads properly', async () => {
    expect(component.exists('AdvancedSearchResultComp')).toBeTruthy()
  })

  it('Show search results on page', async () => {
    expect(component.find('#toggleIconEmpty').hostNodes()).toHaveLength(1)
    expect(component.find('#toggleIconFill').hostNodes()).toHaveLength(0)
  })

  it('will open save bookmark modal after clicking empty toggle button', async () => {
    component.find('#toggleIconEmpty').hostNodes().simulate('click')
    component.update()
    expect(component.find('#bookmarkModal').hostNodes()).toHaveLength(1)
  })

  it('should disable confirm button if no query name is provided', async () => {
    store.dispatch(
      setAdvancedSearchParam({
        ...advancedSearchInitialState,
        event: 'death',
        deceasedFirstNames: 'Iliyas',
        registrationStatuses: ['IN_PROGRESS']
      })
    )
    component.update()
    component.find('#toggleIconEmpty').hostNodes().simulate('click')
    component.update()
    expect(
      component.find('#bookmark_advanced_search_result').hostNodes().props()
        .disabled
    ).toBeTruthy()
  })

  it('should enable confirm button if query name is provided', async () => {
    component.find('#toggleIconEmpty').hostNodes().simulate('click')
    component.update()
    component
      .find('#queryName')
      .hostNodes()
      .simulate('change', {
        target: { name: 'queryName', value: 'Death Search' }
      })
    component.update()
    expect(
      component.find('#bookmark_advanced_search_result').hostNodes().props()
        .disabled
    ).toBeFalsy()
  })

  it('should bookmark advanced search result & show notification if click on confirm button', async () => {
    component.find('#toggleIconEmpty').hostNodes().simulate('click')
    component.update()
    component
      .find('#queryName')
      .hostNodes()
      .simulate('change', {
        target: { name: 'queryName', value: 'Death Search' }
      })
    component.update()
    component
      .find('#bookmark_advanced_search_result')
      .hostNodes()
      .simulate('click')
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    await flushPromises()
    component.update()
    expect(
      component.find('#success-save-bookmark-notification').hostNodes()
    ).toHaveLength(1)
  })

  it('should remove bookmark advanced search & show notification if click on confirm button', async () => {
    store.dispatch(
      setAdvancedSearchParam({
        ...advancedSearchInitialState,
        event: 'death',
        deceasedFirstNames: 'Iliyas',
        registrationStatuses: ['IN_PROGRESS'],
        searchId: '1321356'
      })
    )
    component.update()
    component.find('#toggleIconFill').hostNodes().simulate('click')
    component.update()

    component
      .find('#remove_advanced_search_bookmark')
      .hostNodes()
      .simulate('click')
    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    await flushPromises()
    component.update()
    expect(
      component.find('#success-save-bookmark-notification').hostNodes()
    ).toHaveLength(1)
  })
})
