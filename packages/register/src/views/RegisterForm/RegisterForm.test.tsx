import * as React from 'react'
import {
  createTestComponent,
  selectOption,
  mockApplicationData,
  mockDeathApplicationData,
  mockDeathApplicationDataWithoutFirstNames,
  getRegisterFormFromStore,
  getReviewFormFromStore,
  createTestStore
} from '@register/tests/util'
import { RegisterForm } from '@register/views/RegisterForm/RegisterForm'
import { ReactWrapper } from 'enzyme'
import {
  createApplication,
  createReviewApplication,
  storeApplication,
  setInitialApplications,
  IUserData,
  getCurrentUserID,
  getApplicationsOfCurrentUser,
  writeApplicationByUser,
  deleteApplicationByUser,
  IApplication,
  SUBMISSION_STATUS
} from '@register/applications'
import { v4 as uuid } from 'uuid'
import { AppStore } from '@register/store'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  HOME,
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP
} from '@opencrvs/register/src/navigation/routes'

import { Event, IFormData } from '@opencrvs/register/src/forms'
import { draftToGqlTransformer } from '@register/transformer'
import { IForm } from '@register/forms'
import { clone, cloneDeep } from 'lodash'
import { FETCH_REGISTRATION } from '@opencrvs/register/src/forms/register/queries/registration'
import { FETCH_PERSON } from '@opencrvs/register/src/forms/register/queries/person'
import { storage } from '@register/storage'
import { IUserDetails } from '@register/utils/userUtils'

import { formMessages as messages } from '@register/i18n/messages'
import * as profileSelectors from '@register/profile/profileSelectors'
import { getRegisterForm } from '@register/forms/register/application-selectors'
import { waitForElement } from '@register/tests/wait-for-element'
import { History } from 'history'

describe('when user logs in', () => {
  // Some mock data

  const draft1 = createApplication(Event.BIRTH)
  const draft2 = createApplication(Event.DEATH)
  const draft3 = createApplication(Event.BIRTH)

  const currentUserData: IUserData = {
    userID: 'shakib75',
    applications: [draft1, draft2]
  }

  const anotherUserData: IUserData = {
    userID: 'mortaza',
    applications: [draft3]
  }

  const currentUserDetails: IUserDetails = {
    language: 'en',
    userMgntUserID: 'shakib75'
  }

  const indexedDB = {
    USER_DATA: JSON.stringify([currentUserData, anotherUserData]),
    USER_DETAILS: JSON.stringify(currentUserDetails)
  }

  // Mocking storage reading
  // @ts-ignore
  storage.getItem = jest.fn((key: string) => {
    switch (key) {
      case 'USER_DATA':
      case 'USER_DETAILS':
        return indexedDB[key]
      default:
        return undefined
    }
  })

  // Mocking storage writing
  // @ts-ignore
  storage.setItem = jest.fn((key: string, value: string) => {
    switch (key) {
      case 'USER_DATA':
      case 'USER_DETAILS':
        indexedDB[key] = value
        break
      default:
        break
    }
  })

  it('should read userID correctly', async () => {
    const uID = await getCurrentUserID() // reads from USER_DETAILS and returns the userMgntUserID, if exists
    expect(uID).toEqual('shakib75')
  })

  it('should read only the drafts of the currently logged-in user', async () => {
    const details = await getApplicationsOfCurrentUser()
    const currentUserDrafts = (JSON.parse(details) as IUserData).applications
    expect(currentUserDrafts.length).toBe(2)
    expect(currentUserDrafts[0]).toEqual(draft1)
    expect(currentUserDrafts[1]).toEqual(draft2)
    expect(currentUserDrafts.find(draft => draft.id === draft3.id)).toBeFalsy()
  })

  describe('Application in index db', () => {
    let draft: IApplication

    beforeAll(async () => {
      draft = createApplication(Event.DEATH)
      await writeApplicationByUser(currentUserData.userID, draft)
    })

    it("should save the draft inside the current user's array of drafts", async () => {
      // Now, let's check if the new draft is added
      const details = await getApplicationsOfCurrentUser()
      const currentUserDrafts = (JSON.parse(details) as IUserData).applications
      expect(currentUserDrafts.length).toBe(3)
      expect(currentUserDrafts[0]).toBeTruthy()
    })

    it("should delete the draft from the current user's array of applications", async () => {
      await deleteApplicationByUser(currentUserData.userID, draft)

      // Now, let's check if the new draft is added
      const details = await getApplicationsOfCurrentUser()
      const currentUserDrafts = (JSON.parse(details) as IUserData).applications
      expect(currentUserDrafts.length).toBe(2)
      expect(
        currentUserDrafts.find(cDraft => cDraft.id === draft.id)
      ).toBeFalsy()
    })
  })
})

describe('when there is no user-data saved', () => {
  it('should return an empty array', async () => {
    // Mocking storage reading
    // @ts-ignore
    storage.getItem = jest.fn((key: string): string => {
      switch (key) {
        case 'USER_DATA':
          return '[]'
        case 'USER_DETAILS':
          return '{ "userMgntUserID": "tamimIq" }'
        default:
          return ''
      }
    })
    const str = await getApplicationsOfCurrentUser()
    const drafts = (JSON.parse(str) as IUserData).applications
    expect(drafts.length).toBe(0)
  })
})

describe('when user is in the register form before initial draft load', () => {
  it('throws error when draft not found after initial drafts load', async () => {
    const { store, history } = await createTestStore()

    const mock: any = jest.fn()
    const draft = createApplication(Event.BIRTH)
    const form = await getRegisterFormFromStore(store, Event.BIRTH)

    try {
      await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
          match={{
            params: { applicationId: '', pageId: '', groupId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})

describe('when user is in the register form for birth event', () => {
  let component: ReactWrapper<{}, {}>

  let store: AppStore
  let history: History

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const storeContext = await createTestStore()
      store = storeContext.store
      history = storeContext.history

      const draft = createApplication(Event.BIRTH)
      store.dispatch(storeApplication(draft))
      store.dispatch(setInitialApplications())
      store.dispatch(storeApplication(draft))

      const mock: any = jest.fn()
      const form = await getRegisterFormFromStore(store, Event.BIRTH)
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'mother',
              groupId: 'mother-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
    })
    it('renders the page', () => {
      expect(
        component.find('#form_section_title_mother-view-group').hostNodes()
      ).toHaveLength(1)
    })
    it('changes the country select', async () => {
      const select = selectOption(
        component,
        '#countryPermanent',
        'United States of America'
      )
      expect(component.find(select).text()).toEqual('United States of America')
    })
    it('takes field agent to declaration submitted page when save button is clicked', () => {
      localStorage.getItem = jest.fn(
        (key: string) =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJkZWNsYXJlIiwiZGVtbyJdLCJpYXQiOjE1NjMyNTYyNDIsImV4cCI6MTU2Mzg2MTA0MiwiYXVkIjpbIm9wZW5jcnZzOmF1dGgtdXNlciIsIm9wZW5jcnZzOnVzZXItbWdudC11c2VyIiwib3BlbmNydnM6aGVhcnRoLXVzZXIiLCJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJvcGVuY3J2czpub3RpZmljYXRpb24tdXNlciIsIm9wZW5jcnZzOndvcmtmbG93LXVzZXIiLCJvcGVuY3J2czpzZWFyY2gtdXNlciIsIm9wZW5jcnZzOm1ldHJpY3MtdXNlciIsIm9wZW5jcnZzOnJlc291cmNlcy11c2VyIl0sImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjVkMWM1YTJhNTgxNjM0MDBlZjFkMDEyOSJ9.hZu0em2JA0sl-5uzck4mn4HfYdzxSmgoERA8SbWRPXEmriSYjs4PEPk9StXF_Ed5kd53VlNF9xf39DDGWqyyn76gpcMPbHJAL8nqLV82hot8fgU1WtEk865U8-9oAxaVmxAsjpHayiuD6zfKuR-ixrLFdoRKP13LdORktFCQe5e7To2w7vXArjUb6SDpSHST4Fbkhg8vzOcykweSGiNlmoEVtLzkpamS6fcTGRHkNpb_Wk_AQW9TAdw6NqG5lDEAO10auNgJpKxO8X-DQKhvEfY5TbpblR51L_U8pUXpDCAvGegMLnwmfAIoH1hMj--Wd2JhqgUvj0YrlDKI99fntA'
      )
      component
        .find('#save_draft')
        .hostNodes()
        .simulate('click')
      expect(history.location.pathname).toEqual('/field-agent-home/progress')
    })
    it('takes registrar to declaration submitted page when save button is clicked', () => {
      localStorage.getItem = jest.fn(
        (key: string) =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsInBlcmZvcm1hbmNlIiwiY2VydGlmeSIsImRlbW8iXSwiaWF0IjoxNTYzOTcyOTQ0LCJleHAiOjE1NjQ1Nzc3NDQsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpyZXNvdXJjZXMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1ZDFjNWEyYTU4MTYzNDAwZWYxZDAxMmIifQ.VrH31goeitKvLHQchy5HQJkQWjhK-cWisxSgQUXChK4MZQis9Ufzn7dWK3s2s0dSpnFqk-0Yj5cVlq7JgQVcniO26WhnSyXHYQk7DG-TSA5FXGYoKMhjMZCh5qOZTRaVI6yvnEsLKTYeNvkXKJ2wb6M9U5OWjUh1KGPexd9mSjUsUwZ5BDTvI0WjnBTgQ_a0-KhxjjypT8Y_VXiiY-KWLxuOpVGalv3P3nbH8dAUzEuzKsrq6q0MJsaJkgDliaz2pZd10JxnJE1VYUob2SNHFnmJnz8Llwe1lH4xa8rluIA6YBmxdkrU2VkhCBPD6VxGYRHrD3LKRa3Cgm1X0qNQTw'
      )
      component
        .find('#save_draft')
        .hostNodes()
        .simulate('click')
      expect(
        history.location.pathname.includes('/registration-home/progress')
      ).toBeTruthy()
    })
  })
})

describe('when user is in the register form for death event', () => {
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()
  let form: IForm
  let store: AppStore
  let history: History
  let draft: ReturnType<typeof createApplication>

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history

    draft = createApplication(Event.DEATH)
    store.dispatch(setInitialApplications())
    store.dispatch(storeApplication(draft))
    form = await getRegisterFormFromStore(store, Event.DEATH)
  })
  describe('when user is in optional cause of death section', () => {
    beforeEach(async () => {
      const clonedForm = cloneDeep(form)
      clonedForm.sections[2].optional = true
      clonedForm.sections[2].notice = messages.causeOfDeathNotice
      clonedForm.sections[2].groups[0].ignoreSingleFieldView = true
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={clonedForm}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'causeOfDeath' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
    })
    it('renders the optional label', () => {
      expect(
        component
          .find('#form_section_opt_label_causeOfDeath-causeOfDeathEstablished')
          .hostNodes()
      ).toHaveLength(1)
    })

    it('renders the notice component', () => {
      expect(
        component
          .find('#form_section_notice_causeOfDeath-causeOfDeathEstablished')
          .hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('when user is in deceased section', () => {
    it('renders loader button when idType is Birth Registration Number', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth Registration Number')
      expect(component.find('#fetchButton').hostNodes()).toHaveLength(1)
    })

    it('renders loader button when idType is National ID', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')
      expect(component.find('#fetchButton').hostNodes()).toHaveLength(1)
    })

    it('fetches deceased information by entered BRN', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION,
            variables: {
              identifier: '2019333494BQNXOHJ2'
            }
          },
          result: {
            data: {
              queryRegistrationByIdentifier: {
                id: '47cc78a6-3d42-4253-8050-843b278d496b',
                child: {
                  id: 'e969527e-be14-4577-99b6-8e1f8000c274',
                  name: [
                    {
                      use: 'bn',
                      firstNames: 'গায়ত্রী',
                      familyName: 'স্পিভক'
                    },
                    {
                      use: 'en',
                      firstNames: 'Gayatri',
                      familyName: 'Spivak'
                    }
                  ],
                  birthDate: '2018-08-01',
                  gender: 'female'
                }
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth Registration Number')

      component.find('input#iD').simulate('change', {
        target: { id: 'iD', value: '2019333494BQNXOHJ2' }
      })

      component.update()
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        1
      )
    })

    it('fetches deceased information by entered NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON,
            variables: {
              identifier: '1234567898765'
            }
          },
          result: {
            data: {
              queryPersonByIdentifier: {
                id: '26499e5c-72a2-42f6-b8e6-1ffc99b5311e',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: 'female',
                address: [
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'PERMANENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  },
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'CURRENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')

      component.find('input#iD').simulate('change', {
        target: { id: 'iD', value: '1234567898765' }
      })

      component.update()
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        1
      )
    })

    it('fetches informant information by entered NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON,
            variables: {
              identifier: '1234567898765'
            }
          },
          result: {
            data: {
              queryPersonByIdentifier: {
                id: '26499e5c-72a2-42f6-b8e6-1ffc99b5311e',
                name: [
                  {
                    use: 'bn',
                    firstNames: 'গায়ত্রী',
                    familyName: 'স্পিভক'
                  },
                  {
                    use: 'en',
                    firstNames: 'Gayatri',
                    familyName: 'Spivak'
                  }
                ],
                birthDate: '2018-08-01',
                gender: 'female',
                address: [
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'PERMANENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  },
                  {
                    line: [
                      '40',
                      '',
                      'My street',
                      '0df3c0f7-9166-4b7a-809d-b2524d322d1f',
                      '',
                      '3f65c407-e249-4096-9291-404f9e682897'
                    ],
                    type: 'CURRENT',
                    city: null,
                    district: 'dc00ae85-5457-4db4-8fe5-79f1d063f0f7',
                    state: 'ed1492b2-5f2f-4356-aa43-371508d6b69c',
                    postalCode: '10024',
                    country: 'BGD'
                  }
                ]
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'informant' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')

      component.find('input#applicantID').simulate('change', {
        target: { id: 'applicantID', value: '1234567898765' }
      })

      component.update()
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        1
      )
    })

    it('displays error message if no registration found by BRN', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_REGISTRATION,
            variables: {
              identifier: '2019333494BQNXOHJ2'
            }
          },
          error: new Error('boom')
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth Registration Number')

      const input = component.find('input#iD')
      // @ts-ignore
      input
        .props()
        // @ts-ignore
        .onChange({
          // @ts-ignore
          target: {
            // @ts-ignore
            id: 'iD',
            value: '2019333494BQNXOHJ2'
          }
        })
      component.update()

      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component.update()

      expect(component.find('#loader-button-error').hostNodes()).toHaveLength(1)
    })

    it('displays error message if no registration found by NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON,
            variables: {
              identifier: '1234567898765'
            }
          },
          error: new Error('boom')
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'deceased' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID')

      const input = component.find('input#iD')
      // @ts-ignore
      input
        .props()
        // @ts-ignore
        .onChange({
          // @ts-ignore
          target: {
            // @ts-ignore
            id: 'iD',
            value: '1234567898765'
          }
        })
      component.update()

      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })
      component.update()

      expect(component.find('#loader-button-error').hostNodes()).toHaveLength(1)
    })
  })
  describe('when user is death event section', () => {
    it('renders the notice label for date field', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          scope={mock}
          foform
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: 'deathEvent' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      expect(
        testComponent.component.find('#deathDate_notice').hostNodes()
      ).toHaveLength(1)
    })
  })
})

describe('when user is in the register form preview section', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History
  const mock = jest.fn()

  beforeEach(async () => {
    mock.mockReset()
    const storeContext = await createTestStore()
    store = storeContext.store
    history = storeContext.history

    const draft = createApplication(Event.BIRTH)
    store.dispatch(setInitialApplications())
    store.dispatch(storeApplication(draft))

    const form = await getRegisterFormFromStore(store, Event.BIRTH)
    const testComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        history={history}
        registerForm={form}
        application={draft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
        match={{
          params: { applicationId: draft.id, pageId: 'preview' },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent.component
  })

  it('submit button will be enabled when even if form is not fully filled-up', () => {
    expect(
      component
        .find('#submit_form')
        .hostNodes()
        .prop('disabled')
    ).toBe(false)
  })

  it('Displays submit confirm modal when submit button is clicked', () => {
    component
      .find('#submit_form')
      .hostNodes()
      .simulate('click')

    expect(component.find('#submit_confirm').hostNodes()).toHaveLength(1)
  })

  describe('User in the Preview section for submitting the Form', () => {
    beforeEach(async () => {
      // @ts-ignore
      const nApplication = createReviewApplication(
        uuid(),
        mockApplicationData,
        Event.BIRTH
      )
      nApplication.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      store.dispatch(setInitialApplications())
      store.dispatch(storeApplication(nApplication))

      const nform = getRegisterForm(store.getState())[Event.BIRTH]
      const nTestComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          history={history}
          registerForm={nform}
          application={nApplication}
          pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
          match={{
            params: { applicationId: nApplication.id, pageId: 'preview' },
            isExact: true,
            path: '',
            url: ''
          }}
          scope={[]}
        />,
        store
      )
      component = nTestComponent.component
    })

    it('should be able to submit the form', () => {
      component
        .find('#submit_form')
        .hostNodes()
        .simulate('click')
      component.update()

      const cancelBtn = component.find('#cancel-btn').hostNodes()
      expect(cancelBtn.length).toEqual(1)

      cancelBtn.simulate('click')
      component.update()

      expect(component.find('#submit_confirm').hostNodes().length).toEqual(0)
      expect(component.find('#submit_form').hostNodes().length).toEqual(1)

      component
        .find('#submit_form')
        .hostNodes()
        .simulate('click')
      component.update()

      const confirmBtn = component.find('#submit_confirm').hostNodes()
      expect(confirmBtn.length).toEqual(1)

      confirmBtn.simulate('click')
      component.update()

      expect(history.location.pathname).toBe(HOME)
    })
  })
})

describe('when user is in the register form review section', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store, history } = await createTestStore()
    // @ts-ignore
    const application = createReviewApplication(
      uuid(),
      mockApplicationData,
      Event.BIRTH
    )
    store.dispatch(setInitialApplications())
    store.dispatch(storeApplication(application))
    const mock: any = jest.fn()
    jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])

    const form = await getReviewFormFromStore(store, Event.BIRTH)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        scope={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        application={application}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            applicationId: application.id,
            pageId: 'review'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent.component
  })

  it('clicking the reject button launches the reject form action page', async () => {
    component
      .find('#rejectApplicationBtn')
      .hostNodes()
      .simulate('click')

    await waitForElement(component, '#reject-registration-form-container')
    expect(
      component.find('#reject-registration-form-container').hostNodes()
    ).toHaveLength(1)
  })
})

describe('When user is in Preview section death event', () => {
  let store: AppStore
  let history: History
  let component: ReactWrapper<{}, {}>
  let deathDraft
  let deathForm: IForm

  const mock: any = jest.fn()

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history

    const draft = createApplication(Event.DEATH)
    store.dispatch(setInitialApplications())
    store.dispatch(storeApplication(draft))
    jest.clearAllMocks()
    // @ts-ignore
    deathDraft = createReviewApplication(
      uuid(),
      // @ts-ignore
      mockDeathApplicationData,
      Event.DEATH
    )
    deathDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialApplications())
    store.dispatch(storeApplication(deathDraft))

    jest.spyOn(profileSelectors, 'getScope').mockReturnValue(['declare'])

    deathForm = await getRegisterFormFromStore(store, Event.DEATH)
    const nTestComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={deathForm}
        application={deathDraft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
        match={{
          params: { applicationId: deathDraft.id, pageId: 'preview' },
          isExact: true,
          path: '',
          url: ''
        }}
        scope={[]}
      />,
      store
    )
    component = nTestComponent.component
  })

  it('Check if death location type is parsed properly', () => {
    expect(
      draftToGqlTransformer(deathForm, mockDeathApplicationData as IFormData)
        .eventLocation.type
    ).toBe('OTHER')
  })

  it('Check if death location partOf is parsed properly', () => {
    expect(
      draftToGqlTransformer(deathForm, mockDeathApplicationData as IFormData)
        .eventLocation.partOf
    ).toBe('Location/upazila')
  })

  it('Should be able to submit the form', () => {
    component
      .find('#submit_form')
      .hostNodes()
      .simulate('click')

    const confirmBtn = component.find('#submit_confirm').hostNodes()
    expect(confirmBtn.length).toEqual(1)

    confirmBtn.simulate('click')
    component.update()

    expect(history.location.pathname).toBe(HOME)
  })
  it('Check if death location as hospital is parsed properly', () => {
    const hospitalLocatioMockDeathApplicationData = clone(
      mockDeathApplicationData
    )
    hospitalLocatioMockDeathApplicationData.deathEvent.deathPlaceAddress =
      'HEALTH_INSTITUTION'
    hospitalLocatioMockDeathApplicationData.deathEvent.deathLocation =
      '5e3736a0-090e-43b4-9012-f1cef399e123'

    expect(
      draftToGqlTransformer(
        deathForm,
        hospitalLocatioMockDeathApplicationData as IFormData
      ).eventLocation.type
    ).toBe(undefined)
  })

  it('Check if death location as hospital _fhirID is parsed properly', () => {
    const hospitalLocatioMockDeathApplicationData = clone(
      mockDeathApplicationData
    )
    hospitalLocatioMockDeathApplicationData.deathEvent.deathPlaceAddress =
      'HEALTH_INSTITUTION'
    hospitalLocatioMockDeathApplicationData.deathEvent.deathLocation =
      '5e3736a0-090e-43b4-9012-f1cef399e123'

    expect(
      draftToGqlTransformer(
        deathForm,
        hospitalLocatioMockDeathApplicationData as IFormData
      ).eventLocation._fhirID
    ).toBe('5e3736a0-090e-43b4-9012-f1cef399e123')
  })

  it('Check if death location is deceased parmanent address', () => {
    const mockDeathApplication = clone(mockDeathApplicationData)
    mockDeathApplication.deathEvent.deathPlaceAddress = 'PERMANENT'

    expect(
      draftToGqlTransformer(deathForm, mockDeathApplication as IFormData)
        .eventLocation.address.type
    ).toBe('PERMANENT')
  })

  it('Death location should be undefined if no decased address is found', () => {
    const mockDeathApplication = cloneDeep(mockDeathApplicationData)
    // @ts-ignore
    mockDeathApplication.deceased = {
      iDType: 'NATIONAL_ID',
      iD: '1230000000000',
      firstNames: 'মকবুল',
      familyName: 'ইসলাম',
      firstNamesEng: 'Mokbul',
      familyNameEng: 'Islam',
      nationality: 'BGD',
      gender: 'male',
      maritalStatus: 'MARRIED',
      birthDate: '1987-02-16'
    }
    mockDeathApplication.deathEvent.deathPlaceAddress = 'CURRENT'

    expect(
      draftToGqlTransformer(deathForm, mockDeathApplication as IFormData)
        .eventLocation
    ).toBe(undefined)
  })
})

describe('When user is in Preview section death event in offline mode', () => {
  let component: ReactWrapper<{}, {}>
  let deathDraft
  let deathForm: IForm
  let store: AppStore
  let history: History

  const mock: any = jest.fn()

  beforeEach(async () => {
    const testStore = await createTestStore()
    history = testStore.history
    store = testStore.store

    const draft = createApplication(Event.DEATH)
    store.dispatch(setInitialApplications())
    store.dispatch(storeApplication(draft))

    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true
    })
    jest.clearAllMocks()
    // @ts-ignore
    deathDraft = createReviewApplication(
      uuid(),
      // @ts-ignore
      mockDeathApplicationDataWithoutFirstNames,
      Event.DEATH
    )
    deathDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialApplications())
    store.dispatch(storeApplication(deathDraft))

    deathForm = await getRegisterFormFromStore(store, Event.DEATH)
    const nTestComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={deathForm}
        application={deathDraft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
        match={{
          params: { applicationId: deathDraft.id, pageId: 'preview' },
          isExact: true,
          path: '',
          url: ''
        }}
        scope={[]}
      />,
      store
    )
    component = nTestComponent.component
  })

  it('Should be able to submit the form', async () => {
    component
      .find('#submit_form')
      .hostNodes()
      .simulate('click')

    const confirmBtn = component.find('#submit_confirm').hostNodes()
    expect(confirmBtn.length).toEqual(1)

    confirmBtn.simulate('click')
    component.update()

    expect(history.location.pathname).toBe(HOME)
  })
})
