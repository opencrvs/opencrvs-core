import { GridTable } from '@opencrvs/components/lib/interface'
import {
  createApplication,
  IApplication,
  storeApplication,
  SUBMISSION_STATUS
} from '@register/applications'
import { Event } from '@register/forms'
import { formatUrl } from '@register/navigation'
import {
  REGISTRAR_HOME_TAB,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@register/navigation/routes'
import { checkAuth } from '@register/profile/profileActions'
import { queries } from '@register/profile/queries'
import { storage } from '@register/storage'
import { createStore } from '@register/store'
import {
  createTestComponent,
  mockUserResponse,
  resizeWindow
} from '@register/tests/util'
import {
  COUNT_EVENT_REGISTRATION_BY_STATUS,
  FETCH_REGISTRATION_BY_COMPOSITION,
  LIST_EVENT_REGISTRATIONS_BY_STATUS
} from '@register/views/RegistrationHome/queries'
import { EVENT_STATUS } from '@register/views/RegistrationHome/RegistrationHome'
import { merge } from 'lodash'
import moment from 'moment'
import * as React from 'react'
import { InProgressTab, SELECTOR_ID, TAB_ID } from './inProgressTab'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsInBlcmZvcm1hbmNlIiwiY2VydGlmeSIsImRlbW8iXSwiaWF0IjoxNTYzMzQzMTMzLCJleHAiOjE1NjM5NDc5MzMsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpyZXNvdXJjZXMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1ZDI1ZWM4YTI0YjExMGMyNWEyN2JhNjcifQ.C5v0fboxhawmzrHrO2kzdwfe9pNrF23UedkiPo_4PTBLuS6dm1UgPZWV7SXT9_JVS7djpH2lh-wZ24CR6S-QWI1QgGdvXGrzyUsayJxCdh2FSBnmgLpsD-LTvbDefpmliWzjLk_glbcqeoFX54hwjORZrsH6JMac4GSRRq2vL_Lq7bBUae7IdmB8itoZQLJJHi29bsCvGr3h1njV5BUvQ4N0Q9-w7QAd-ZPjTz4hYf_biFn52fWMwYaxY6_zA5GB6Bm_6ibI8cz14wY4fEME2cv33x4DwVRD8z4UL_Qq14nqWMO5EEf5mb_YKH-wTPl3kUzofngRsMY8cKI_YTr_1Q'
const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()

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
      role: 'DISTRICT_REGISTRAR'
    }
  }
}
merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

const { store, history } = createStore()
beforeAll(() => {
  getItem.mockReturnValue(registerScopeToken)
  store.dispatch(checkAuth({ '?token': registerScopeToken }))
})

describe('In Progress tab', () => {
  it('redirects to different route upon selection', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_EVENT_REGISTRATION_BY_STATUS,
          variables: {
            locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
            status: EVENT_STATUS.IN_PROGRESS
          }
        },
        result: {
          data: {
            countEventRegistrationsByStatus: {
              count: 5
            }
          }
        }
      }
    ]
    const localDrafts = [
      {
        id: '1',
        event: Event.BIRTH,
        data: {}
      },
      {
        id: '2',
        event: Event.BIRTH,
        data: {}
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <InProgressTab
        drafts={localDrafts}
        registrarLocationId={'2a83cf14-b959-47f4-8097-f75a75d1867f'}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component

    app
      .find(`#selector_${SELECTOR_ID.ownDrafts}`)
      .hostNodes()
      .simulate('click')
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    expect(history.location.pathname).toBe(
      formatUrl(REGISTRAR_HOME_TAB, {
        tabId: TAB_ID.inProgress,
        selectorId: SELECTOR_ID.ownDrafts
      })
    )
    app
      .find(`#selector_${SELECTOR_ID.fieldAgentDrafts}`)
      .hostNodes()
      .simulate('click')
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    expect(history.location.pathname).toBe(
      formatUrl(REGISTRAR_HOME_TAB, {
        tabId: TAB_ID.inProgress,
        selectorId: SELECTOR_ID.fieldAgentDrafts
      })
    )
  })
  it('renders two selectors with count for each', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_EVENT_REGISTRATION_BY_STATUS,
          variables: {
            locationIds: ['2a83cf14-b959-47f4-8097-f75a75d1867f'],
            status: EVENT_STATUS.IN_PROGRESS
          }
        },
        result: {
          data: {
            countEventRegistrationsByStatus: {
              count: 5
            }
          }
        }
      }
    ]
    const localDrafts = [
      {
        id: '1',
        event: Event.BIRTH,
        data: {}
      },
      {
        id: '2',
        event: Event.BIRTH,
        data: {}
      }
    ]

    const testComponent = await createTestComponent(
      // @ts-ignore
      <InProgressTab
        drafts={localDrafts}
        selectorId={'you'}
        registrarLocationId={'2a83cf14-b959-47f4-8097-f75a75d1867f'}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component

    expect(
      app
        .find('#selector_you')
        .hostNodes()
        .text()
    ).toContain('Yours (2)')
    expect(
      app
        .find('#selector_field-agents')
        .hostNodes()
        .text()
    ).toContain('Field agents (5)')
  })

  describe('When the local drafts selector is selected', () => {
    it('renders all items returned from local storage in inProgress tab', async () => {
      const { store } = createStore()
      const TIME_STAMP = 1562912635549
      const drafts: IApplication[] = [
        {
          id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
          data: {
            registration: {
              presentAtBirthRegistration: 'MOTHER_ONLY',
              applicant: 'MOTHER_ONLY',
              registrationPhone: '01722222222',
              whoseContactDetails: 'MOTHER'
            },
            child: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          },
          event: Event.BIRTH,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          modifiedOn: TIME_STAMP
        },
        {
          id: 'e6605607-92e0-4625-87d8-c168205bdde7',
          event: Event.BIRTH,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            registration: {
              presentAtBirthRegistration: 'MOTHER_ONLY',
              applicant: 'MOTHER_ONLY',
              registrationPhone: '01722222222',
              whoseContactDetails: 'MOTHER'
            },
            child: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
          data: {
            deceased: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          },
          event: Event.DEATH,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          modifiedOn: TIME_STAMP
        },

        {
          id: '607afa75-4fb0-4785-9388-724911d62809',
          data: {
            deceased: {
              firstNamesEng: 'Anik',
              familyNameEng: 'Hoque'
            }
          },
          event: Event.DEATH,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          modifiedOn: TIME_STAMP
        }
      ]
      // @ts-ignore
      const testComponent = await createTestComponent(
        // @ts-ignore
        <InProgressTab
          drafts={drafts}
          selectorId={SELECTOR_ID.ownDrafts}
          registrarLocationId={'2a83cf14-b959-47f4-8097-f75a75d1867f'}
        />,
        store
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()
      const data = testComponent.component.find(GridTable).prop('content')
      const EXPECTED_DATE_OF_REJECTION = moment(TIME_STAMP).fromNow()

      expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
      expect(data[0].name).toBe('Anik Hoque')
      expect(data[0].dateOfModification).toBe(EXPECTED_DATE_OF_REJECTION)
      expect(data[0].event).toBe('Birth')
      expect(data[0].actions).toBeDefined()
    })

    it('Should render pagination in progress tab if data is more than 10', async () => {
      jest.clearAllMocks()
      const drafts: IApplication[] = []
      for (let i = 0; i < 12; i++) {
        drafts.push(createApplication(Event.BIRTH))
      }
      const testComponent = await createTestComponent(
        // @ts-ignore
        <InProgressTab
          drafts={drafts}
          selectorId={SELECTOR_ID.ownDrafts}
          registrarLocationId={'2a83cf14-b959-47f4-8097-f75a75d1867f'}
        />,
        store
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const pagiBtn = testComponent.component.find('#pagination')

      expect(pagiBtn.hostNodes()).toHaveLength(1)
      testComponent.component
        .find('#pagination button')
        .last()
        .hostNodes()
        .simulate('click')
    })

    it('redirects user to draft preview page on update click', async () => {
      const TIME_STAMP = 1562912635549
      const drafts: IApplication[] = [
        {
          id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
          event: Event.BIRTH,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            child: {
              firstNamesEng: 'Anik',
              firstNames: 'অনিক',
              familyNameEng: 'Hoque',
              familyName: 'অনিক'
            }
          }
        },
        {
          id: 'bd22s7c5-ad87-4117-91c1-35eaf2ese32bw',
          event: Event.BIRTH,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            child: {
              familyNameEng: 'Hoque'
            }
          }
        },
        {
          id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be9',
          event: Event.BIRTH,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            child: {
              familyName: 'অনিক'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
          event: Event.DEATH,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            deceased: {
              firstNamesEng: 'Anik',
              firstNames: 'অনিক',
              familyNameEng: 'Hoque',
              familyName: 'অনিক'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f2',
          event: Event.DEATH,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            deceased: {
              familyNameEng: 'Hoque'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f3',
          event: Event.DEATH,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            deceased: {
              familyName: 'অনিক'
            }
          }
        },
        {
          id: 'cc66d69c-7f0a-4047-9283-f066571830f4',
          event: Event.DEATH,
          modifiedOn: TIME_STAMP,
          submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
          data: {
            '': {}
          }
        }
      ]
      // @ts-ignore
      store.dispatch(storeApplication(drafts))
      const testComponent = await createTestComponent(
        // @ts-ignore
        <InProgressTab
          drafts={drafts}
          selectorId={SELECTOR_ID.ownDrafts}
          registrarLocationId={'2a83cf14-b959-47f4-8097-f75a75d1867f'}
        />,
        store
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()
      expect(
        testComponent.component.find('#ListItemAction-0-Update').hostNodes()
      ).toHaveLength(1)
      testComponent.component
        .find('#ListItemAction-0-Update')
        .hostNodes()
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      expect(history.location.pathname).toContain(
        '/drafts/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      )
    })
  })

  describe('When the remote drafts selector is selected', () => {
    it('renders all items returned from graphql query in inProgress tab', async () => {
      const TIME_STAMP = 1562912635549
      const drafts: IApplication[] = []
      drafts.push(createApplication(Event.BIRTH))
      const graphqlMock = [
        {
          request: {
            query: LIST_EVENT_REGISTRATIONS_BY_STATUS,
            variables: {
              locationIds: ['0627c48a-c721-4ff9-bc6e-1fba59a2332a'],
              status: EVENT_STATUS.IN_PROGRESS,
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 2,
                results: [
                  {
                    id: 'f0a1ca2c-6a14-4b9e-a627-c3e2e110587e',
                    registration: {
                      type: 'BIRTH',
                      trackingId: 'BQ2IDOP'
                    },
                    child: {
                      name: [
                        {
                          use: 'en',
                          firstNames: 'Anik',
                          familyName: 'Hoque'
                        }
                      ]
                    },
                    deceased: null,
                    createdAt: TIME_STAMP
                  },
                  {
                    id: '2f7828fd-24ac-49fd-a1fd-53cda4777aa0',
                    registration: {
                      type: 'DEATH',
                      trackingId: 'DZECJZC'
                    },
                    child: null,
                    deceased: null,
                    createdAt: TIME_STAMP
                  }
                ]
              }
            }
          }
        }
      ]
      // @ts-ignore
      const testComponent = await createTestComponent(
        // @ts-ignore
        <InProgressTab
          drafts={drafts}
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          registrarLocationId={'0627c48a-c721-4ff9-bc6e-1fba59a2332a'}
        />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()
      const data = testComponent.component.find(GridTable).prop('content')
      const EXPECTED_DATE_OF_REJECTION = moment(TIME_STAMP).fromNow()

      expect(data[0].id).toBe('f0a1ca2c-6a14-4b9e-a627-c3e2e110587e')
      expect(data[0].name).toBe('Anik Hoque')
      expect(data[0].dateOfModification).toBe(EXPECTED_DATE_OF_REJECTION)
      expect(data[0].event).toBe('Birth')
      expect(data[0].actions).toBeDefined()
    })

    it('Should render pagination in progress tab if data is more than 10', async () => {
      jest.clearAllMocks()
      const drafts: IApplication[] = []
      drafts.push(createApplication(Event.BIRTH))
      const graphqlMock = [
        {
          request: {
            query: LIST_EVENT_REGISTRATIONS_BY_STATUS,
            variables: {
              locationIds: ['0627c48a-c721-4ff9-bc6e-1fba59a2332a'],
              status: EVENT_STATUS.IN_PROGRESS,
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 12,
                results: [
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  },
                  {
                    id: null,
                    registration: null,
                    child: null,
                    deceased: null,
                    createdAt: null
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <InProgressTab
          drafts={drafts}
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          registrarLocationId={'0627c48a-c721-4ff9-bc6e-1fba59a2332a'}
        />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      const pagiBtn = testComponent.component.find('#pagination')

      expect(pagiBtn.hostNodes()).toHaveLength(1)
      testComponent.component
        .find('#pagination button')
        .last()
        .hostNodes()
        .simulate('click')
    })

    it('renders expanded area for remote draft data', async () => {
      jest.clearAllMocks()
      const TIME_STAMP = 1562912635549
      const drafts: IApplication[] = []
      drafts.push(createApplication(Event.BIRTH))
      const applicationId = 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      const graphqlMock = [
        {
          request: {
            query: LIST_EVENT_REGISTRATIONS_BY_STATUS,
            variables: {
              locationIds: ['0627c48a-c721-4ff9-bc6e-1fba59a2332a'],
              status: EVENT_STATUS.IN_PROGRESS,
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: applicationId,
                    registration: {
                      type: 'BIRTH',
                      trackingId: 'BQ2IDOP'
                    },
                    child: {
                      name: [
                        {
                          use: 'en',
                          firstNames: 'Anik',
                          familyName: 'Hoque'
                        }
                      ]
                    },
                    deceased: null,
                    createdAt: TIME_STAMP
                  }
                ]
              }
            }
          }
        },
        {
          request: {
            query: FETCH_REGISTRATION_BY_COMPOSITION,
            variables: {
              id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
            }
          },
          result: {
            data: {
              fetchRegistration: {
                id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                registration: {
                  id: '345678',
                  type: 'BIRTH',
                  certificates: null,
                  status: [
                    {
                      id:
                        '17e9b24-b00f-4a0f-a5a4-9c84c6e64e98/_history/86c3044a-329f-418',
                      timestamp: '2019-04-03T07:08:24.936Z',
                      user: {
                        id: '153f8364-96b3-4b90-8527-bf2ec4a367bd',
                        name: [
                          {
                            use: 'en',
                            firstNames: 'Mohammad',
                            familyName: 'Ashraful'
                          },
                          {
                            use: 'bn',
                            firstNames: '',
                            familyName: ''
                          }
                        ],
                        role: 'LOCAL_REGISTRAR'
                      },
                      location: {
                        id: '123',
                        name: 'Kaliganj Union Sub Center',
                        alias: ['']
                      },
                      office: {
                        id: '123',
                        name: 'Kaliganj Union Sub Center',
                        alias: [''],
                        address: {
                          district: '7876',
                          state: 'iuyiuy'
                        }
                      },
                      type: 'IN_PROGRESS',
                      comments: [
                        {
                          comment: 'reason=duplicate&comment=dup'
                        }
                      ]
                    }
                  ],
                  contact: 'MOTHER',
                  contactPhoneNumber: '01622688231'
                },
                child: {
                  name: [
                    {
                      use: 'en',
                      firstNames: 'Mushraful',
                      familyName: 'Hoque'
                    }
                  ],
                  birthDate: '01-01-1984'
                },
                deceased: null,
                informant: null
              }
            }
          }
        }
      ]

      // @ts-ignore
      const testComponent = await createTestComponent(
        // @ts-ignore
        <InProgressTab
          drafts={drafts}
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          registrarLocationId={'0627c48a-c721-4ff9-bc6e-1fba59a2332a'}
        />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      const instance = testComponent.component.find(GridTable).instance() as any

      instance.toggleExpanded('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      testComponent.component.update()
      expect(
        testComponent.component.find('#IN_PROGRESS-0').hostNodes().length
      ).toBe(1)
    })
    it('redirects user to draft preview page on update click', async () => {
      jest.clearAllMocks()
      const TIME_STAMP = 1562912635549
      const drafts: IApplication[] = []
      drafts.push(createApplication(Event.BIRTH))
      const applicationId = 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
      const graphqlMock = [
        {
          request: {
            query: LIST_EVENT_REGISTRATIONS_BY_STATUS,
            variables: {
              locationIds: ['0627c48a-c721-4ff9-bc6e-1fba59a2332a'],
              status: EVENT_STATUS.IN_PROGRESS,
              count: 10,
              skip: 0
            }
          },
          result: {
            data: {
              listEventRegistrations: {
                totalItems: 1,
                results: [
                  {
                    id: applicationId,
                    registration: {
                      type: 'BIRTH',
                      trackingId: 'BQ2IDOP'
                    },
                    child: {
                      name: [
                        {
                          use: 'en',
                          firstNames: 'Anik',
                          familyName: 'Hoque'
                        }
                      ]
                    },
                    deceased: null,
                    createdAt: TIME_STAMP
                  }
                ]
              }
            }
          }
        }
      ]

      // @ts-ignore
      const testComponent = await createTestComponent(
        // @ts-ignore
        <InProgressTab
          drafts={drafts}
          selectorId={SELECTOR_ID.fieldAgentDrafts}
          registrarLocationId={'0627c48a-c721-4ff9-bc6e-1fba59a2332a'}
        />,
        store,
        graphqlMock
      )

      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()
      expect(
        testComponent.component.find('#ListItemAction-0-Update').hostNodes()
      ).toHaveLength(1)
      testComponent.component
        .find('#ListItemAction-0-Update')
        .hostNodes()
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      testComponent.component.update()

      expect(history.location.pathname).toContain(
        formatUrl(REVIEW_EVENT_PARENT_FORM_PAGE, {
          applicationId,
          pageId: 'review',
          event: 'birth'
        })
      )
    })
  })
})

describe('Tablet tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
    resizeWindow(800, 1280)
  })

  afterEach(() => {
    resizeWindow(1024, 768)
  })

  it('redirects to detail page if item is clicked', async () => {
    jest.clearAllMocks()
    const TIME_STAMP = 1562912635549
    const drafts: IApplication[] = []
    drafts.push(createApplication(Event.BIRTH))
    const applicationId = 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
    const graphqlMock = [
      {
        request: {
          query: LIST_EVENT_REGISTRATIONS_BY_STATUS,
          variables: {
            locationIds: ['0627c48a-c721-4ff9-bc6e-1fba59a2332a'],
            status: EVENT_STATUS.IN_PROGRESS,
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            listEventRegistrations: {
              totalItems: 1,
              results: [
                {
                  id: applicationId,
                  registration: {
                    type: 'BIRTH',
                    trackingId: 'BQ2IDOP'
                  },
                  child: {
                    name: [
                      {
                        use: 'en',
                        firstNames: 'Anik',
                        familyName: 'Hoque'
                      }
                    ]
                  },
                  deceased: null,
                  createdAt: TIME_STAMP
                }
              ]
            }
          }
        }
      }
    ]

    // @ts-ignore
    const testComponent = await createTestComponent(
      // @ts-ignore
      <InProgressTab
        drafts={drafts}
        selectorId={SELECTOR_ID.fieldAgentDrafts}
        registrarLocationId={'0627c48a-c721-4ff9-bc6e-1fba59a2332a'}
      />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    testComponent.component
      .find('#row_0')
      .hostNodes()
      .simulate('click')

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(window.location.href).toContain(
      '/details/e302f7c5-ad87-4117-91c1-35eaf2ea7be8'
    )
  })
})
