import { createStore } from '@register/store'
import { SEARCH_USERS } from '@register/sysadmin/user/queries'
import { createTestComponent, flushPromises } from '@register/tests/util'
import * as React from 'react'
import { UserTab } from './userTab'

describe('User tab tests', () => {
  const { store } = createStore()

  describe('Header test', () => {
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
      const testComponent = await createTestComponent(
        // @ts-ignore
        <UserTab />,
        store,
        userListMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 200)
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
    it('add user button redirects to user form', async () => {
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
      const testComponent = await createTestComponent(
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
      app
        .find('#add-user')
        .hostNodes()
        .simulate('click')

      await flushPromises()

      testComponent.component.update()
      expect(window.location.href).toContain('/createUser')
    })
  })

  describe('Table test', () => {
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
      const testComponent = await createTestComponent(
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
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'pending'
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'disabled'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
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

  describe('Pagination test', () => {
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
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'pending'
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'disabled'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
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
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b796',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ashraful',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'ma.alam',
                    role: 'FIELD_AGENT',
                    type: 'CHA',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b797',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Lovely',
                        familyName: 'Khatun'
                      }
                    ],
                    username: 'l.khatun',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b794',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    username: 'ma.abdullah',
                    role: 'NATIONAL_REGISTRAR',
                    type: 'SECRETARY',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b798',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Seikh',
                        familyName: 'Farid'
                      }
                    ],
                    username: 'ms.farid',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b799',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Jahangir',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'mj.alam',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
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
                    id: '5d08e102542c7a19fc55b790',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Rabindranath',
                        familyName: 'Tagore'
                      }
                    ],
                    username: 'r.tagore',
                    role: 'REGISTRATION_AGENT',
                    type: 'ENTREPENEUR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b791',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohammad',
                        familyName: 'Ashraful'
                      }
                    ],
                    username: 'm.ashraful',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b792',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Muhammad Abdul',
                        familyName: 'Muid Khan'
                      }
                    ],
                    username: 'ma.muidkhan',
                    role: 'DISTRICT_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b793',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Nasreen Pervin',
                        familyName: 'Huq'
                      }
                    ],
                    username: 'np.huq',
                    role: 'STATE_REGISTRAR',
                    type: 'MAYOR',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b795',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ariful',
                        familyName: 'Islam'
                      }
                    ],
                    username: 'ma.islam',
                    role: 'FIELD_AGENT',
                    type: 'HOSPITAL',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b796',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Ashraful',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'ma.alam',
                    role: 'FIELD_AGENT',
                    type: 'CHA',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b797',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Lovely',
                        familyName: 'Khatun'
                      }
                    ],
                    username: 'l.khatun',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b794',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Mohamed Abu',
                        familyName: 'Abdullah'
                      }
                    ],
                    username: 'ma.abdullah',
                    role: 'NATIONAL_REGISTRAR',
                    type: 'SECRETARY',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b798',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Seikh',
                        familyName: 'Farid'
                      }
                    ],
                    username: 'ms.farid',
                    role: 'REGISTRATION_AGENT',
                    type: 'DATA_ENTRY_CLERK',
                    status: 'active'
                  },
                  {
                    id: '5d08e102542c7a19fc55b799',
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Md. Jahangir',
                        familyName: 'Alam'
                      }
                    ],
                    username: 'mj.alam',
                    role: 'LOCAL_REGISTRAR',
                    type: 'CHAIRMAN',
                    status: 'active'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
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
