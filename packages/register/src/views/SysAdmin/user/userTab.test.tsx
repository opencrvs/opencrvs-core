import * as React from 'react'
import { createStore } from 'src/store'
import { SEARCH_USERS } from 'src/sysadmin/user/queries'
import { createTestComponent } from 'src/tests/util'
import { UserTab } from './userTab'

describe('User tab tests', async () => {
  const { store } = createStore()

  describe('Header test', async () => {
    it('renders header with user count', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        // @ts-ignore
        <UserTab />,
        store,
        userListMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const app = testComponent.component
      expect(
        app
          .find('#user_list')
          .hostNodes()
          .html()
      ).toContain('Users (0)')
    })
  })

  describe('Table test', async () => {
    it('renders no result text for empty user list in response', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 0,
                results: []
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        // @ts-ignore
        <UserTab />,
        store,
        userListMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const app = testComponent.component
      expect(app.find('#no-record').hostNodes()).toHaveLength(1)
    })

    it('renders list of users', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 5,
                results: [
                  {
                    id: '5cfe3c5727cf63466dfd22e7',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: 'Chairman',
                    active: true
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e8',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    role: 'LOCAL_REGISTRAR',
                    type: null,
                    active: false
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e9',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    role: 'DISTRICT_REGISTRAR',
                    type: null,
                    active: true
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ea',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    role: 'STATE_REGISTRAR',
                    type: null,
                    active: true
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22eb',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    role: 'REGISTRAR',
                    type: null,
                    active: true
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        // @ts-ignore
        <UserTab />,
        store,
        userListMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const app = testComponent.component
      expect(app.find('#user_list').hostNodes()).toHaveLength(1)
    })
  })

  describe('Pagination test', async () => {
    it('renders no pagination block when the total amount of data is not applicable for pagination', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 5,
                results: [
                  {
                    id: '5cfe3c5727cf63466dfd22e7',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: 'Chairman',
                    active: true
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e8',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    role: 'LOCAL_REGISTRAR',
                    type: null,
                    active: false
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e9',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    role: 'DISTRICT_REGISTRAR',
                    type: null,
                    active: true
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ea',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    role: 'STATE_REGISTRAR',
                    type: null,
                    active: true
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22eb',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    role: 'REGISTRAR',
                    type: null,
                    active: true
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        // @ts-ignore
        <UserTab />,
        store,
        userListMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const app = testComponent.component
      expect(app.find('#pagination').hostNodes()).toHaveLength(0)
    })
    it('renders pagination block with proper page value when the total amount of data is applicable for pagination', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 15,
                results: [
                  {
                    id: '5cfe3c5727cf63466dfd22e6',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Sakib Al',
                        familyName: 'Hasan',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'FIELD_AGENT',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e7',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e8',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'LOCAL_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e9',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'DISTRICT_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ea',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'STATE_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22eb',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'NATIONAL_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ec',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'FIELD_AGENT',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ed',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ashraful',
                        familyName: 'Alam',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'FIELD_AGENT',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ee',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Lovely',
                        familyName: 'Khatun',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ef',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Seikh',
                        familyName: 'Farid',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: null,
                    active: true,
                    __typename: 'User'
                  }
                ],
                __typename: 'SearchUserResult'
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        // @ts-ignore
        <UserTab />,
        store,
        userListMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const app = testComponent.component
      expect(
        app
          .find('#pagination')
          .hostNodes()
          .text()
      ).toContain('1/2')
    })
    it('renders next page of the user list when the next page button is pressed', async () => {
      const userListMock = [
        {
          request: {
            query: SEARCH_USERS,
            variables: {
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              searchUsers: {
                totalItems: 15,
                results: [
                  {
                    id: '5cfe3c5727cf63466dfd22e6',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Sakib Al',
                        familyName: 'Hasan',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'FIELD_AGENT',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e7',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e8',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'LOCAL_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22e9',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'DISTRICT_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ea',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'STATE_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22eb',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'NATIONAL_REGISTRAR',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ec',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'FIELD_AGENT',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ed',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ashraful',
                        familyName: 'Alam',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'FIELD_AGENT',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ee',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Lovely',
                        familyName: 'Khatun',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: null,
                    active: true,
                    __typename: 'User'
                  },
                  {
                    id: '5cfe3c5727cf63466dfd22ef',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Seikh',
                        familyName: 'Farid',
                        __typename: 'HumanName'
                      }
                    ],
                    role: 'REGISTRATION_CLERK',
                    type: null,
                    active: true,
                    __typename: 'User'
                  }
                ],
                __typename: 'SearchUserResult'
              }
            }
          }
        }
      ]
      const testComponent = createTestComponent(
        // @ts-ignore
        <UserTab />,
        store,
        userListMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const app = testComponent.component
      expect(app.find('#pagination').hostNodes()).toHaveLength(1)
      expect(app.find('#next').hostNodes()).toHaveLength(1)

      app
        .find('#next')
        .hostNodes()
        .simulate('click')
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      expect(
        app
          .find('#pagination')
          .hostNodes()
          .text()
      ).toContain('2/2')
    })
  })
})
