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
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { Workqueue } from '@opencrvs/components/lib/Workqueue'

import { merge } from 'lodash'
import * as React from 'react'
import { queries } from '@client/profile/queries'
import { SEARCH_EVENTS } from '@client/search/queries'
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockUserResponse,
  REGISTRAR_DEFAULT_SCOPES,
  setScopes
} from '@client/tests/util'
import { SearchResult } from '@client/views/SearchResult/SearchResult'

import { waitForElement } from '@client/tests/wait-for-element'
import { EventType } from '@client/utils/gateway'
import { storeDeclaration } from '@client/declarations'
import { vi } from 'vitest'

const mockFetchUserDetails = vi.fn()

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
        id: 'DISTRICT_REGISTRAR',
        label: {
          defaultMessage: 'District Registrar',
          description: 'Name for user role Field Agent',
          id: 'userRole.fieldAgent'
        }
      }
    }
  }
}

merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

describe('SearchResult tests', () => {
  let store: ReturnType<typeof createStore>['store']

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
  })

  it('sets loading state while waiting for data', async () => {
    const { component: testComponent } = await createTestComponent(
      <SearchResult />,
      { store, initialEntries: ['/?searchText=DW0UTHR&searchType=TRACKING_ID'] }
    )

    // @ts-ignore
    expect(testComponent.containsMatchingElement(Spinner)).toBe(true)
  })

  it('renders all items returned from graphql query', async () => {
    const graphqlMock = [
      {
        request: {
          operationName: null,
          query: SEARCH_EVENTS,
          variables: {
            advancedSearchParameters: {
              trackingId: '',
              nationalId: '',
              registrationNumber: '',
              contactNumber: '+8801622688232',
              name: '',
              contactEmail: ''
            },
            sort: 'DESC'
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 4,
              results: [
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: EventType.Death,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'DECLARED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
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
                },
                {
                  id: 'c7e83060-4db9-4057-8b14-71841243b05f',
                  type: EventType.Death,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'REJECTED',
                    trackingId: 'DXMJPYA',
                    registrationNumber: null,
                    duplicates: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    reason:
                      'duplicate,misspelling,missing_supporting_doc,other',
                    comment: 'Rejected'
                  },
                  dateOfDeath: '2010-01-01',
                  deceasedName: [
                    {
                      __typename: 'X',
                      firstNames: 'Zahir',
                      familyName: 'Raihan'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'জহির',
                      familyName: 'রায়হান'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfBirth: '',
                  childName: []
                },
                {
                  id: '150dd4ca-6822-4f94-ad92-b9be037dec2f',
                  type: EventType.Birth,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'REGISTERED',
                    trackingId: 'BQRZWDR',
                    registrationNumber: '2019333494BQRZWDR2',
                    duplicates: null,
                    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
                  },
                  dateOfBirth: '2010-01-01',
                  childName: [
                    {
                      __typename: 'X',
                      firstNames: 'Fokrul',
                      familyName: 'Islam'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'ফকরুল',
                      familyName: 'ইসলাম'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfDeath: '',
                  deceasedName: []
                },
                {
                  id: '150dd4ca-6822-4f94-ad92-brbe037dec2f',
                  type: EventType.Birth,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'VALIDATED',
                    trackingId: 'BQRZWDR',
                    registrationNumber: '2019333494BQRZWDR2',
                    duplicates: null,
                    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
                  },
                  dateOfBirth: '2010-01-01',
                  childName: [
                    {
                      __typename: 'X',
                      firstNames: 'Fokrul',
                      familyName: 'Islam'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'ফকরুল',
                      familyName: 'ইসলাম'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfDeath: '',
                  deceasedName: []
                },
                {
                  id: '150dd4ca-6822-4f94-ad92-b9beee7dec2f',
                  type: EventType.Birth,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'WAITING_VALIDATION',
                    trackingId: 'BQRZWDR',
                    registrationNumber: '2019333494BQRZWDR2',
                    duplicates: null,
                    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
                  },
                  dateOfBirth: '2010-01-01',
                  childName: [
                    {
                      __typename: 'X',
                      firstNames: 'Fokrul',
                      familyName: 'Islam'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'ফকরুল',
                      familyName: 'ইসলাম'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfDeath: '',
                  deceasedName: []
                },
                {
                  id: 'fd60a75e-314e-4231-aab7-e6b71fb1106a',
                  type: EventType.Birth,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'CERTIFIED',
                    trackingId: 'B3DBJMP',
                    registrationNumber: '2019333494B3DBJMP5',
                    duplicates: null,
                    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1'
                  },
                  dateOfBirth: '2008-01-01',
                  childName: [
                    {
                      __typename: 'X',
                      firstNames: 'Rafiq',
                      familyName: 'Islam'
                    },
                    {
                      __typename: 'X',
                      firstNames: 'রফিক',
                      familyName: 'ইসলাম'
                    }
                  ],

                  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
                  // PR: https://github.com/opencrvs/opencrvs-core/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
                  dateOfDeath: '',
                  deceasedName: []
                }
              ],
              __typename: 'EventSearchResultSet'
            }
          }
        }
      }
    ]

    const { component: testComponent } = await createTestComponent(
      <SearchResult />,
      {
        store,
        graphqlMocks: graphqlMock as any,
        initialEntries: ['/?searchText=01622688232&searchType=PHONE_NUMBER']
      }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    testComponent.update()
    const data = testComponent.find(Workqueue).prop('content')
    expect(data.length).toEqual(6)
  })

  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            advancedSearchParameters: {
              trackingId: '',
              nationalId: '',
              registrationNumber: '',
              contactNumber: '+8801622688232',
              contactEmail: ''
            },
            sort: 'DESC'
          }
        },
        error: new Error('boom')
      }
    ]

    const { component: testComponent } = await createTestComponent(
      <SearchResult
        // @ts-ignore
        location={{
          search: '?searchText=+8801622688232&searchType=PHONE_NUMBER'
        }}
      />,
      {
        store,
        graphqlMocks: graphqlMock as any,
        initialEntries: ['/?searchText=+8801622688232&searchType=PHONE_NUMBER']
      }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()
    expect(
      testComponent.find('#search-result-error-text').hostNodes().text()
    ).toBe('An error occurred while searching')
  })
  it('renders empty search page with a header in small devices', async () => {
    const testSearchResultComponent = await createTestComponent(
      <SearchResult />,
      { store, initialEntries: ['/search?location='] }
    )

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 200
    })

    const searchTextInput = testSearchResultComponent.component
      .find('#searchText')
      .hostNodes()

    expect(searchTextInput).toHaveLength(1)

    searchTextInput.simulate('change', { target: { value: 'DW0UTHR' } })

    testSearchResultComponent.component
      .find('#searchIconButton')
      .hostNodes()
      .simulate('click')

    expect(testSearchResultComponent.router.state.location.search).toBe(
      '?searchText=DW0UTHR&searchType=TRACKING_ID'
    )
  })

  it('renders download button and modals in search page', async () => {
    const graphqlMock = [
      {
        request: {
          operationName: null,
          query: SEARCH_EVENTS,
          variables: {
            advancedSearchParameters: {
              trackingId: 'DW0UTHR',
              nationalId: '',
              registrationNumber: '',
              contactNumber: '',
              name: '',
              contactEmail: ''
            },
            sort: 'DESC'
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 1,
              results: [
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: EventType.Death,
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
      }
    ]

    const { component: testComponent } = await createTestComponent(
      <SearchResult />,
      {
        store,
        graphqlMocks: graphqlMock as any,
        initialEntries: ['/?searchText=DW0UTHR&searchType=TRACKING_ID']
      }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()
    testComponent.find('#ListItemAction-0-icon').hostNodes().simulate('click')

    expect(testComponent.find('#assignment').hostNodes()).toHaveLength(1)
  })

  it('renders print button in search page', async () => {
    const declaration = {
      id: 'bc09200d-0160-43b4-9e2b-5b9e90424e92',
      data: {},
      event: EventType.Birth,
      downloadStatus: 'DOWNLOADED',
      submissionStatus: 'REGISTERED'
    }

    // @ts-ignore
    store.dispatch(storeDeclaration(declaration))
    const graphqlMock = [
      {
        request: {
          operationName: null,
          query: SEARCH_EVENTS,
          variables: {
            advancedSearchParameters: {
              trackingId: 'DW0UTHR',
              nationalId: '',
              registrationNumber: '',
              contactNumber: '',
              name: '',
              contactEmail: ''
            },
            sort: 'DESC'
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 1,
              results: [
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e92',
                  type: EventType.Death,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'REGISTERED',
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
      }
    ]

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1100
    })
    const { component: testComponent } = await createTestComponent(
      <SearchResult />,
      {
        store,
        graphqlMocks: graphqlMock as any,
        initialEntries: ['/?searchText=DW0UTHR&searchType=TRACKING_ID']
      }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()
    const printButton = await waitForElement(
      testComponent,
      '#ListItemAction-0-Print'
    )
    printButton.hostNodes().simulate('click')
    expect(printButton.hostNodes()).toHaveLength(1)
  })

  it('renders review button in search page while declaration is validated', async () => {
    const declaration = {
      id: 'bc09200d-0160-43b4-9e2b-5b9e90424e91',
      data: {},
      event: EventType.Birth,
      downloadStatus: 'DOWNLOADED',
      submissionStatus: 'VALIDATED'
    }

    // @ts-ignore
    store.dispatch(storeDeclaration(declaration))
    const graphqlMock = [
      {
        request: {
          operationName: null,
          query: SEARCH_EVENTS,
          variables: {
            advancedSearchParameters: {
              trackingId: 'DW0UTHR',
              nationalId: '',
              registrationNumber: '',
              contactNumber: '',
              name: '',
              contactEmail: ''
            },
            sort: 'DESC'
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 1,
              results: [
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e91',
                  type: EventType.Death,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'VALIDATED',
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
      }
    ]

    const { component: testComponent } = await createTestComponent(
      <SearchResult />,
      {
        store,
        graphqlMocks: graphqlMock as any,
        initialEntries: ['/?searchText=DW0UTHR&searchType=TRACKING_ID']
      }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()

    const reviewButton = await waitForElement(
      testComponent,
      '#ListItemAction-0-Review'
    )

    expect(reviewButton.hostNodes()).toHaveLength(1)
  })
})

describe('SearchResult downloadButton tests', () => {
  let store: ReturnType<typeof createStore>['store']

  beforeEach(async () => {
    ;({ store } = createStore())
    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
  })
  it('renders review button in search page', async () => {
    const declaration = {
      id: 'bc09200d-0160-43b4-9e2b-5b9e90424e91',
      data: {},
      event: EventType.Birth,
      downloadStatus: 'DOWNLOADED',
      submissionStatus: 'DECLARED'
    }

    // @ts-ignore
    store.dispatch(storeDeclaration(declaration))
    const graphqlMock = [
      {
        request: {
          operationName: null,
          query: SEARCH_EVENTS,
          variables: {
            advancedSearchParameters: {
              trackingId: 'DW0UTHR',
              nationalId: '',
              registrationNumber: '',
              contactNumber: '',
              name: '',
              contactEmail: ''
            },
            sort: 'DESC'
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 1,
              results: [
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e91',
                  type: EventType.Death,
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
      }
    ]

    const { component: testComponent } = await createTestComponent(
      <SearchResult />,
      {
        store,
        graphqlMocks: graphqlMock as any,
        initialEntries: ['/?searchText=DW0UTHR&searchType=TRACKING_ID']
      }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()

    const reviewButton = await waitForElement(
      testComponent,
      '#ListItemAction-0-Review'
    )

    expect(reviewButton.hostNodes()).toHaveLength(1)
  })
  it('renders update button in search page', async () => {
    const declaration = {
      id: 'bc09200d-0160-43b4-9e2b-5b9e90424e92',
      data: {},
      event: EventType.Birth,
      downloadStatus: 'DOWNLOADED',
      submissionStatus: 'REJECTED'
    }

    // @ts-ignore
    store.dispatch(storeDeclaration(declaration))
    const graphqlMock = [
      {
        request: {
          operationName: null,
          query: SEARCH_EVENTS,
          variables: {
            advancedSearchParameters: {
              trackingId: 'DW0UTHR',
              nationalId: '',
              registrationNumber: '',
              contactNumber: '',
              name: '',
              contactEmail: ''
            },
            sort: 'DESC'
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 1,
              results: [
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e92',
                  type: EventType.Death,
                  __typename: 'X',
                  registration: {
                    __typename: 'X',
                    status: 'REJECTED',
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
      }
    ]

    const { component: testComponent } = await createTestComponent(
      <SearchResult />,
      {
        store,
        graphqlMocks: graphqlMock as any,
        initialEntries: ['/?searchText=DW0UTHR&searchType=TRACKING_ID']
      }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    testComponent.update()

    const updateButton = await waitForElement(
      testComponent,
      '#ListItemAction-0-Update'
    )

    expect(updateButton.hostNodes()).toHaveLength(1)
  })
})
