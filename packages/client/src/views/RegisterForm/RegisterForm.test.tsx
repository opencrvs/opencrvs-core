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
import {
  createTestComponent,
  selectOption,
  mockApplicationData,
  mockDeathApplicationData,
  mockDeathApplicationDataWithoutFirstNames,
  getRegisterFormFromStore,
  getReviewFormFromStore,
  createTestStore,
  flushPromises
} from '@client/tests/util'
import { RegisterForm } from '@client/views/RegisterForm/RegisterForm'
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
  SUBMISSION_STATUS,
  modifyApplication
} from '@client/applications'
import { v4 as uuid } from 'uuid'
import { AppStore } from '@client/store'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  HOME,
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  REGISTRAR_HOME
} from '@opencrvs/client/src/navigation/routes'

import { Event, IFormData } from '@opencrvs/client/src/forms'
import { draftToGqlTransformer } from '@client/transformer'
import { IForm } from '@client/forms'
import { clone, cloneDeep } from 'lodash'
import { FETCH_REGISTRATION } from '@opencrvs/client/src/forms/register/queries/registration'
import { FETCH_PERSON_NID } from '@opencrvs/client/src/forms/register/queries/person'
import { storage } from '@client/storage'
import { IUserDetails } from '@client/utils/userUtils'

import { formMessages as messages } from '@client/i18n/messages'
import * as profileSelectors from '@client/profile/profileSelectors'
import { getRegisterForm } from '@client/forms/register/application-selectors'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'
import { DECLARED } from '@client/utils/constants'
import debounce from 'lodash/debounce'
jest.mock('lodash/debounce', () => jest.fn((fn) => fn))

describe('when user is in the register form for birth event', () => {
  let component: ReactWrapper<{}, {}>

  let store: AppStore
  let history: History

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      ;(debounce as jest.Mock).mockImplementation((fn) => fn)
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
      expect(select.text()).toEqual('United States of America')
    })
    it('takes field agent to declaration submitted page when save button is clicked', async () => {
      localStorage.getItem = jest.fn(
        (key: string) =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJkZWNsYXJlIiwiZGVtbyJdLCJpYXQiOjE1NjMyNTYyNDIsImV4cCI6MTU2Mzg2MTA0MiwiYXVkIjpbIm9wZW5jcnZzOmF1dGgtdXNlciIsIm9wZW5jcnZzOnVzZXItbWdudC11c2VyIiwib3BlbmNydnM6aGVhcnRoLXVzZXIiLCJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJvcGVuY3J2czpub3RpZmljYXRpb24tdXNlciIsIm9wZW5jcnZzOndvcmtmbG93LXVzZXIiLCJvcGVuY3J2czpzZWFyY2gtdXNlciIsIm9wZW5jcnZzOm1ldHJpY3MtdXNlciIsIm9wZW5jcnZzOnJlc291cmNlcy11c2VyIl0sImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjVkMWM1YTJhNTgxNjM0MDBlZjFkMDEyOSJ9.hZu0em2JA0sl-5uzck4mn4HfYdzxSmgoERA8SbWRPXEmriSYjs4PEPk9StXF_Ed5kd53VlNF9xf39DDGWqyyn76gpcMPbHJAL8nqLV82hot8fgU1WtEk865U8-9oAxaVmxAsjpHayiuD6zfKuR-ixrLFdoRKP13LdORktFCQe5e7To2w7vXArjUb6SDpSHST4Fbkhg8vzOcykweSGiNlmoEVtLzkpamS6fcTGRHkNpb_Wk_AQW9TAdw6NqG5lDEAO10auNgJpKxO8X-DQKhvEfY5TbpblR51L_U8pUXpDCAvGegMLnwmfAIoH1hMj--Wd2JhqgUvj0YrlDKI99fntA'
      )
      component.find('#save_draft').hostNodes().simulate('click')
      await flushPromises()
      expect(history.location.pathname).toEqual('/field-agent-home/progress')
    })
    it('takes registrar to declaration submitted page when save button is clicked', async () => {
      localStorage.getItem = jest.fn(
        (key: string) =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsInBlcmZvcm1hbmNlIiwiY2VydGlmeSIsImRlbW8iXSwiaWF0IjoxNTYzOTcyOTQ0LCJleHAiOjE1NjQ1Nzc3NDQsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpyZXNvdXJjZXMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1ZDFjNWEyYTU4MTYzNDAwZWYxZDAxMmIifQ.VrH31goeitKvLHQchy5HQJkQWjhK-cWisxSgQUXChK4MZQis9Ufzn7dWK3s2s0dSpnFqk-0Yj5cVlq7JgQVcniO26WhnSyXHYQk7DG-TSA5FXGYoKMhjMZCh5qOZTRaVI6yvnEsLKTYeNvkXKJ2wb6M9U5OWjUh1KGPexd9mSjUsUwZ5BDTvI0WjnBTgQ_a0-KhxjjypT8Y_VXiiY-KWLxuOpVGalv3P3nbH8dAUzEuzKsrq6q0MJsaJkgDliaz2pZd10JxnJE1VYUob2SNHFnmJnz8Llwe1lH4xa8rluIA6YBmxdkrU2VkhCBPD6VxGYRHrD3LKRa3Cgm1X0qNQTw'
      )
      component.find('#save_draft').hostNodes().simulate('click')
      await flushPromises()
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
    const mock: any = jest.fn()
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
      const mock: any = jest.fn()
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={clonedForm}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'causeOfDeath',
              groupId: 'causeOfDeath-causeOfDeathEstablished'
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

    it('renders the optional label', () => {
      expect(
        component
          .find('#form_section_id_causeOfDeath-causeOfDeathEstablished')
          .hostNodes()
      ).toHaveLength(1)
    })
  })

  describe('when user is in deceased section', () => {
    beforeEach(async () => {
      ;(debounce as jest.Mock).mockImplementation((fn) => fn)
    })
    it('renders loader button when idType is Birth Registration Number', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deceased',
              groupId: 'deceased-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth registration number')
      expect(component.find('#fetchButton').hostNodes()).toHaveLength(0)
    })
  })

  describe('when user is in contact point page', () => {
    beforeEach(async () => {
      ;(debounce as jest.Mock).mockImplementation((fn) => fn)
    })
    it('shows error if click continue without any value', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: '', groupId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      component.find('#next_section').hostNodes().simulate('click')

      await waitForElement(component, '#contactPoint_error')
      expect(component.find('#contactPoint_error').hostNodes().text()).toBe(
        'Required for registration'
      )
    })

    it('after clicking exit, takes back home', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { applicationId: draft.id, pageId: '', groupId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      component.find('#exit_top_bar').hostNodes().simulate('click')

      component.update()

      expect(history.location.pathname).toContain(REGISTRAR_HOME)
    })

    it('renders loader button when idType is National ID', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deceased',
              groupId: 'deceased-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID number')
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
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deceased',
              groupId: 'deceased-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth registration number')

      component.find('input#iD').simulate('change', {
        target: { id: 'iD', value: '201933349411111112' }
      })

      component.update()
      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })

      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        0
      )
    })

    it('fetches deceased information by entered NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON_NID,
            variables: {
              nid: '1234567898',
              dob: '1992-10-10',
              country: 'bgd'
            }
          },
          result: {
            data: {
              queryPersonByNidIdentifier: {
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
                gender: 'female'
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deceased',
              groupId: 'deceased-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID number')

      component.find('input#iD').simulate('change', {
        target: { id: 'iD', value: '1234567898' }
      })

      component.find('input#birthDate-dd').simulate('change', {
        target: { id: 'birthDate-dd', value: '10' }
      })

      component.find('input#birthDate-mm').simulate('change', {
        target: { id: 'birthDate-mm', value: '10' }
      })

      component.find('input#birthDate-yyyy').simulate('change', {
        target: { id: 'birthDate-yyyy', value: '1992' }
      })

      component.update()
      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise((resolve) => {
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
            query: FETCH_PERSON_NID,
            variables: {
              nid: '1234567898',
              dob: '1992-10-10',
              country: 'bgd'
            }
          },
          result: {
            data: {
              queryPersonByNidIdentifier: {
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
                gender: 'female'
              }
            }
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'informant',
              groupId: 'informant-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'National ID number')

      component.find('input#applicantID').simulate('change', {
        target: { id: 'applicantID', value: '1234567898' }
      })

      component.find('input#applicantBirthDate-dd').simulate('change', {
        target: { id: 'applicantBirthDate-dd', value: '10' }
      })

      component.find('input#applicantBirthDate-mm').simulate('change', {
        target: { id: 'applicantBirthDate-mm', value: '10' }
      })

      component.find('input#applicantBirthDate-yyyy').simulate('change', {
        target: { id: 'applicantBirthDate-yyyy', value: '1992' }
      })

      component.update()
      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })
      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      await new Promise((resolve) => {
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
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deceased',
              groupId: 'deceased-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
      component = testComponent.component
      selectOption(component, '#iDType', 'Birth registration number')

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
            value: '201933349411111112'
          }
        })
      component.update()

      expect(component.find('#loader-button-success').hostNodes()).toHaveLength(
        0
      )
    })

    it('displays error message if no registration found by NID', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON_NID,
            variables: {
              nid: '1234567898',
              dob: '1992-10-10',
              country: 'bgd'
            }
          },
          result: {
            data: {
              queryPersonByNidIdentifier: null
            },
            errors: [
              {
                message: 'An internal server error occurred',
                locations: [{ line: 2, column: 3 }],
                path: ['queryPersonByNidIdentifier']
              }
            ]
          }
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deceased',
              groupId: 'deceased-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )

      component = testComponent.component
      await waitForElement(component, '#iDType')
      selectOption(component, '#iDType', 'National ID number')

      const input = component.find('input#iD') as any

      input.hostNodes().props().onChange!({
        target: {
          id: 'iD',
          value: '1234567898'
        }
      })

      component.find('input#birthDate-dd').simulate('change', {
        target: { id: 'birthDate-dd', value: '10' }
      })

      component.find('input#birthDate-mm').simulate('change', {
        target: { id: 'birthDate-mm', value: '10' }
      })

      component.find('input#birthDate-yyyy').simulate('change', {
        target: { id: 'birthDate-yyyy', value: '1992' }
      })

      component.update()

      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      const element = await waitForElement(component, '#loader-button-error')

      expect(element.hostNodes()).toHaveLength(1)
    })

    it('should displays network error message if timeout', async () => {
      const graphqlMock = [
        {
          request: {
            query: FETCH_PERSON_NID,
            variables: {
              nid: '1234567898',
              dob: '1992-10-10',
              country: 'bgd'
            }
          },
          error: new Error('timeout')
        }
      ]
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deceased',
              groupId: 'deceased-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )

      component = testComponent.component
      await waitForElement(component, '#iDType')
      selectOption(component, '#iDType', 'National ID number')

      const input = component.find('input#iD') as any

      input.hostNodes().props().onChange!({
        target: {
          id: 'iD',
          value: '1234567897'
        }
      })

      component.find('input#birthDate-dd').simulate('change', {
        target: { id: 'birthDate-dd', value: '10' }
      })

      component.find('input#birthDate-mm').simulate('change', {
        target: { id: 'birthDate-mm', value: '10' }
      })

      component.find('input#birthDate-yyyy').simulate('change', {
        target: { id: 'birthDate-yyyy', value: '1992' }
      })

      component.update()

      component
        .find('#fetchButton')
        .hostNodes()
        .childAt(0)
        .childAt(0)
        .childAt(0)
        .simulate('click')

      const element = await waitForElement(component, '#loader-button-error')

      expect(element.hostNodes()).toHaveLength(1)
    })
  })
  describe('when user is death event section', () => {
    it('renders the notice label for date field', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          application={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              applicationId: draft.id,
              pageId: 'deathEvent',
              groupId: 'deathEvent-deathDate'
            },
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
          params: {
            applicationId: draft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
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

  it('submit button will be enabled when even if form is not fully filled-up', () => {
    expect(component.find('#submit_form').hostNodes().prop('disabled')).toBe(
      false
    )
  })

  it('Displays submit confirm modal when submit button is clicked', () => {
    component.find('#submit_form').hostNodes().simulate('click')

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
            params: {
              applicationId: nApplication.id,
              pageId: 'preview',
              groupId: 'preview-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )
      component = nTestComponent.component
    })

    it('should be able to submit the form', () => {
      component.find('#submit_form').hostNodes().simulate('click')
      component.update()

      const cancelBtn = component.find('#cancel-btn').hostNodes()
      expect(cancelBtn.length).toEqual(1)

      cancelBtn.simulate('click')
      component.update()

      expect(component.find('#submit_confirm').hostNodes().length).toEqual(0)
      expect(component.find('#submit_form').hostNodes().length).toEqual(1)

      component.find('#submit_form').hostNodes().simulate('click')
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
        history={history}
        staticContext={mock}
        registerForm={form}
        application={application}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            applicationId: application.id,
            pageId: 'review',
            groupId: 'review-view-group'
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
    component.find('#rejectApplicationBtn').hostNodes().simulate('click')

    await waitForElement(component, '#reject-registration-form-container')
    expect(
      component.find('#reject-registration-form-container').hostNodes()
    ).toHaveLength(1)
  })
})

describe('when user is in the register form from review edit', () => {
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
        history={history}
        staticContext={mock}
        registerForm={form}
        application={application}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            applicationId: application.id,
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

  xit('should redirect to progress tab when close application button is clicked', async () => {
    const menuButton = await waitForElement(
      component,
      '#eventToggleMenuToggleButton'
    )
    menuButton.hostNodes().simulate('click')
    component.update()

    const closeApplicationButton = await waitForElement(
      component,
      '#eventToggleMenuItem0'
    )
    closeApplicationButton.hostNodes().simulate('click')
    component.update()
    expect(window.location.href).toContain('/progress')
  })
})

describe('when user is in the register form from sent for review edit', () => {
  let component: ReactWrapper<{}, {}>
  let testAppStore: AppStore
  beforeEach(async () => {
    ;(debounce as jest.Mock).mockImplementation((fn) => fn)
    Date.now = jest.fn(() => 1582525224324)
    const { store, history } = await createTestStore()
    // @ts-ignore
    const application = createReviewApplication(
      uuid(),
      mockApplicationData,
      Event.BIRTH,
      DECLARED
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
        history={history}
        staticContext={mock}
        registerForm={form}
        application={application}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            applicationId: application.id,
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
    testAppStore = testComponent.store
  })

  it('clicking on save draft opens modal', async () => {
    const saveDraftButton = await waitForElement(component, '#save_draft')
    saveDraftButton.hostNodes().simulate('click')
    component.update()
    const saveDraftConfirmationModal = await waitForElement(
      component,
      '#save_application_confirmation'
    )
    expect(saveDraftConfirmationModal.hostNodes()).toHaveLength(1)
  })

  it('clicking save confirm saves the draft', async () => {
    const DRAFT_MODIFY_TIME = 1582525379383
    Date.now = jest.fn(() => DRAFT_MODIFY_TIME)
    selectOption(component, '#iDType', 'National ID number')

    // Do some modifications
    component.find('input#iD').simulate('change', {
      target: { id: 'iD', value: '1234567898' }
    })
    const saveDraftButton = await waitForElement(component, '#save_draft')
    saveDraftButton.hostNodes().simulate('click')
    component.update()
    const saveDraftConfirmationModal = await waitForElement(
      component,
      '#save_application_confirmation'
    )

    saveDraftConfirmationModal
      .find('#confirm_save')
      .hostNodes()
      .simulate('click')
    component.update()

    const modifyTime =
      testAppStore.getState().applicationsState.applications[0].modifiedOn

    expect(modifyTime).toBe(DRAFT_MODIFY_TIME)
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
          params: {
            applicationId: deathDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
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
    ).toBe('Location/1dfc716a-c5f7-4d39-ad71-71d2a359210c')
  })

  it('Should be able to submit the form', () => {
    component.find('#submit_form').hostNodes().simulate('click')

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
      'HEALTH_FACILITY'
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
      'HEALTH_FACILITY'
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
          params: {
            applicationId: deathDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = nTestComponent.component
  })

  it('Should be able to submit the form', async () => {
    component.find('#submit_form').hostNodes().simulate('click')

    const confirmBtn = component.find('#submit_confirm').hostNodes()
    expect(confirmBtn.length).toEqual(1)

    confirmBtn.simulate('click')
    component.update()

    expect(history.location.pathname).toBe(HOME)
  })
})
