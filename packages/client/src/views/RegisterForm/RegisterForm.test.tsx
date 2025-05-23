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
  selectOption,
  mockDeclarationData,
  mockDeathDeclarationData,
  mockMarriageDeclarationData,
  getRegisterFormFromStore,
  getReviewFormFromStore,
  createTestStore,
  flushPromises,
  userDetails,
  mockOfflineData,
  setScopes,
  TestComponentWithRouteMock
} from '@client/tests/util'
import { RegisterForm } from '@client/views/RegisterForm/RegisterForm'
import { ReactWrapper } from 'enzyme'
import {
  createDeclaration,
  createReviewDeclaration,
  storeDeclaration,
  setInitialDeclarations,
  SUBMISSION_STATUS,
  IDeclaration
} from '@client/declarations'
import { v4 as uuid } from 'uuid'
import { AppStore } from '@client/store'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  HOME,
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  DRAFT_MARRIAGE_FORM_PAGE
} from '@opencrvs/client/src/navigation/routes'
import { IFormData } from '@opencrvs/client/src/forms'
import { SCOPES } from '@opencrvs/commons/client'
import { EventType, RegStatus } from '@client/utils/gateway'
import { draftToGqlTransformer } from '@client/transformer'
import { IForm } from '@client/forms'
import { clone, cloneDeep } from 'lodash'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { waitForElement } from '@client/tests/wait-for-element'
import { vi } from 'vitest'
import { createClient } from '@client/utils/apolloClient'
import { ApolloClient } from '@apollo/client'
import { formatUrl } from '@client/navigation'
import { createMemoryRouter } from 'react-router-dom'

describe('when user is in the register form for birth event', () => {
  let component: TestComponentWithRouteMock

  let store: AppStore
  let client: ApolloClient<{}>

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const storeContext = await createTestStore()
      store = storeContext.store
      client = createClient(store)

      const draft = createDeclaration(EventType.Birth)
      store.dispatch(storeDeclaration(draft))
      store.dispatch(setInitialDeclarations())
      store.dispatch(storeDeclaration(draft))

      const form = await getRegisterFormFromStore(store, EventType.Birth)
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          registerForm={form}
          declaration={draft}
          pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP}
        />,
        {
          store,
          apolloClient: client,
          path: DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
          initialEntries: [
            formatUrl(DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP, {
              declarationId: draft.id,
              pageId: 'mother',
              groupId: 'mother-view-group'
            })
          ]
        }
      )
      component = testComponent
    })
    it('takes field agent to declaration submitted page when save & exit button is clicked', async () => {
      localStorage.getItem = vi.fn(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJkZWNsYXJlIiwiZGVtbyJdLCJpYXQiOjE1NjMyNTYyNDIsImV4cCI6MTU2Mzg2MTA0MiwiYXVkIjpbIm9wZW5jcnZzOmF1dGgtdXNlciIsIm9wZW5jcnZzOnVzZXItbWdudC11c2VyIiwib3BlbmNydnM6aGVhcnRoLXVzZXIiLCJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJvcGVuY3J2czpub3RpZmljYXRpb24tdXNlciIsIm9wZW5jcnZzOndvcmtmbG93LXVzZXIiLCJvcGVuY3J2czpzZWFyY2gtdXNlciIsIm9wZW5jcnZzOm1ldHJpY3MtdXNlciIsIm9wZW5jcnZzOnJlc291cmNlcy11c2VyIl0sImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjVkMWM1YTJhNTgxNjM0MDBlZjFkMDEyOSJ9.hZu0em2JA0sl-5uzck4mn4HfYdzxSmgoERA8SbWRPXEmriSYjs4PEPk9StXF_Ed5kd53VlNF9xf39DDGWqyyn76gpcMPbHJAL8nqLV82hot8fgU1WtEk865U8-9oAxaVmxAsjpHayiuD6zfKuR-ixrLFdoRKP13LdORktFCQe5e7To2w7vXArjUb6SDpSHST4Fbkhg8vzOcykweSGiNlmoEVtLzkpamS6fcTGRHkNpb_Wk_AQW9TAdw6NqG5lDEAO10auNgJpKxO8X-DQKhvEfY5TbpblR51L_U8pUXpDCAvGegMLnwmfAIoH1hMj--Wd2JhqgUvj0YrlDKI99fntA'
      )
      component.component.update()

      component.component.find('#save-exit-btn').hostNodes().simulate('click')
      component.component.update()
      component.component
        .find('#confirm_save_exit')
        .hostNodes()
        .simulate('click')
      component.component.update()
      await flushPromises()
      expect(component.router.state.location.pathname).toEqual(
        '/registration-home/my-drafts/1'
      )
    })
    it('takes registrar to declaration submitted page when save button is clicked', async () => {
      localStorage.getItem = vi.fn(
        () =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsInBlcmZvcm1hbmNlIiwiY2VydGlmeSIsImRlbW8iXSwiaWF0IjoxNTYzOTcyOTQ0LCJleHAiOjE1NjQ1Nzc3NDQsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpyZXNvdXJjZXMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1ZDFjNWEyYTU4MTYzNDAwZWYxZDAxMmIifQ.VrH31goeitKvLHQchy5HQJkQWjhK-cWisxSgQUXChK4MZQis9Ufzn7dWK3s2s0dSpnFqk-0Yj5cVlq7JgQVcniO26WhnSyXHYQk7DG-TSA5FXGYoKMhjMZCh5qOZTRaVI6yvnEsLKTYeNvkXKJ2wb6M9U5OWjUh1KGPexd9mSjUsUwZ5BDTvI0WjnBTgQ_a0-KhxjjypT8Y_VXiiY-KWLxuOpVGalv3P3nbH8dAUzEuzKsrq6q0MJsaJkgDliaz2pZd10JxnJE1VYUob2SNHFnmJnz8Llwe1lH4xa8rluIA6YBmxdkrU2VkhCBPD6VxGYRHrD3LKRa3Cgm1X0qNQTw'
      )
      component.component.find('#save-exit-btn').hostNodes().simulate('click')
      component.component.update()
      component.component
        .find('#confirm_save_exit')
        .hostNodes()
        .simulate('click')
      component.component.update()
      await flushPromises()
      expect(
        component.router.state.location.pathname.includes(
          '/registration-home/my-drafts/1'
        )
      ).toBeTruthy()
    })
  })
})

describe('when user is in the register form for death event', () => {
  let component: ReactWrapper<{}, {}>

  let form: IForm
  let store: AppStore
  let draft: ReturnType<typeof createDeclaration>

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store

    draft = createDeclaration(EventType.Death)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    form = await getRegisterFormFromStore(store, EventType.Death)
  })
  describe('when user is in optional cause of death section', () => {
    beforeEach(async () => {
      const clonedForm = cloneDeep(form)
      clonedForm.sections[2].optional = true
      // TODO: need to check if causeOfDeathNotice is needed or not
      // clonedForm.sections[2].notice = messages.causeOfDeathNotice
      clonedForm.sections[2].groups[0].ignoreSingleFieldView = true
      const { component: testComponent } = await createTestComponent(
        <RegisterForm
          registerForm={clonedForm}
          declaration={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
        />,
        {
          store,
          path: DRAFT_DEATH_FORM_PAGE,
          initialEntries: [
            formatUrl(DRAFT_DEATH_FORM_PAGE, {
              declarationId: draft.id,
              pageId: 'deathEvent',
              groupId: 'death-event-details'
            })
          ]
        }
      )
      component = testComponent
    })

    it('renders the deathEvent details page', () => {
      expect(
        component.find('#form_section_id_death-event-details').hostNodes()
      ).toHaveLength(1)
    })
  })
})

describe('when user is in the register form for marriage event', () => {
  let component: ReactWrapper<{}, {}>

  let form: IForm
  let store: AppStore

  let draft: ReturnType<typeof createDeclaration>

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store

    draft = createDeclaration(EventType.Marriage)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    form = await getRegisterFormFromStore(store, EventType.Marriage)
  })

  describe('when user is in marriage section', () => {
    beforeEach(async () => {
      const clonedForm = cloneDeep(form)
      clonedForm.sections[2].optional = true
      clonedForm.sections[2].groups[0].ignoreSingleFieldView = true

      const { component: testComponent } = await createTestComponent(
        <RegisterForm
          registerForm={clonedForm}
          declaration={draft}
          pageRoute={DRAFT_MARRIAGE_FORM_PAGE}
        />,
        {
          store,
          path: DRAFT_MARRIAGE_FORM_PAGE,
          initialEntries: [
            formatUrl(DRAFT_MARRIAGE_FORM_PAGE, {
              declarationId: draft.id,
              pageId: 'marriageEvent',
              groupId: 'marriage-event-details'
            })
          ]
        }
      )
      component = testComponent
    })

    it('renders the marriageEvent details page', () => {
      expect(
        component.find('#form_section_id_marriage-event-details').hostNodes()
      ).toHaveLength(1)
    })
  })
})

describe('when user is in the register form preview section and has the submit complete scope', () => {
  let component: TestComponentWithRouteMock
  let store: AppStore

  const mock = vi.fn()

  beforeEach(async () => {
    mock.mockReset()
    const storeContext = await createTestStore()
    store = storeContext.store

    const draft = createDeclaration(EventType.Birth)
    draft.data = {
      child: { firstNamesEng: 'John', familyNameEng: 'Doe' },
      father: {
        detailsExist: true
      },
      mother: {
        detailsExist: true
      },
      documents: {
        imageUploader: { title: 'dummy', description: 'dummy', data: '' }
      },
      registration: {
        commentsOrNotes: '',
        contactPoint: {
          nestedFields: {
            registrationPhone: '01557394989'
          },
          value: 'MOTHER'
        }
      }
    }
    setScopes([SCOPES.RECORD_SUBMIT_INCOMPLETE], store)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))

    const form = await getRegisterFormFromStore(store, EventType.Birth)
    const testComponent = await createTestComponent(
      <RegisterForm
        registerForm={form}
        declaration={draft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
      />,
      {
        store,
        path: DRAFT_BIRTH_PARENT_FORM_PAGE,
        initialEntries: [
          formatUrl(DRAFT_BIRTH_PARENT_FORM_PAGE, {
            declarationId: draft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          })
        ]
      }
    )
    component = testComponent
  })

  it('submit button will be enabled when even if form is not fully filled-up', () => {
    expect(
      component.component
        .find('#submit_incomplete')
        .hostNodes()
        .prop('disabled')
    ).toBe(false)
  })

  it('Displays submit confirm modal when submit button is clicked', () => {
    component.component.find('#submit_incomplete').hostNodes().simulate('click')

    expect(
      component.component.find('#submit_confirm').hostNodes()
    ).toHaveLength(1)
  })

  describe('User in the Preview section for submitting the Form and has the submit for review scope', () => {
    beforeEach(async () => {
      // @ts-ignore
      const nDeclaration = createReviewDeclaration(
        uuid(),
        mockDeclarationData,
        EventType.Birth
      )
      nDeclaration.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      setScopes([SCOPES.RECORD_SUBMIT_FOR_REVIEW], store)
      store.dispatch(setInitialDeclarations())
      store.dispatch(storeDeclaration(nDeclaration))

      const nform = getRegisterForm(store.getState())[EventType.Birth]
      const nTestComponent = await createTestComponent(
        <RegisterForm
          registerForm={nform}
          declaration={nDeclaration}
          pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
        />,
        {
          store,
          path: DRAFT_BIRTH_PARENT_FORM_PAGE,
          initialEntries: [
            formatUrl(DRAFT_BIRTH_PARENT_FORM_PAGE, {
              declarationId: nDeclaration.id,
              pageId: 'preview',
              groupId: 'preview-view-group'
            })
          ]
        }
      )
      component = nTestComponent
    })

    it('should be able to submit the form', () => {
      component.component
        .find('#submit_for_review')
        .hostNodes()
        .simulate('click')

      component.component.update()

      const cancelBtn = component.component.find('#cancel-btn').hostNodes()
      expect(cancelBtn.length).toEqual(1)

      cancelBtn.simulate('click')
      component.component.update()

      expect(
        component.component.find('#submit_confirm').hostNodes().length
      ).toEqual(0)
      expect(
        component.component.find('#submit_for_review').hostNodes().length
      ).toEqual(1)

      component.component
        .find('#submit_for_review')
        .hostNodes()
        .simulate('click')
      component.component.update()

      const confirmBtn = component.component.find('#submit_confirm').hostNodes()
      expect(confirmBtn.length).toEqual(1)

      confirmBtn.simulate('click')
      component.component.update()
      expect(component.router.state.location.pathname).toBe(HOME)
    })
  })
})

describe('when user is in the register form review section', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store } = await createTestStore()
    // @ts-ignore
    const declaration = createReviewDeclaration(
      uuid(),
      mockDeclarationData,
      EventType.Birth
    )
    setScopes([SCOPES.RECORD_REGISTER, SCOPES.RECORD_SUBMIT_FOR_UPDATES], store)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(declaration))

    const form = await getReviewFormFromStore(store, EventType.Birth)

    const { component: testComponent } = await createTestComponent(
      <RegisterForm
        registerForm={form}
        declaration={declaration}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
      />,
      {
        store,
        path: REVIEW_EVENT_PARENT_FORM_PAGE,
        initialEntries: [
          formatUrl(REVIEW_EVENT_PARENT_FORM_PAGE, {
            declarationId: declaration.id,
            pageId: 'review',
            groupId: 'review-view-group'
          })
        ]
      }
    )
    component = testComponent
  })

  it('clicking the reject button launches the reject form action page', async () => {
    component.find('#rejectDeclarationBtn').hostNodes().simulate('click')

    await waitForElement(component, '#reject-registration-form-container')
    expect(
      component.find('#reject-registration-form-container').hostNodes()
    ).toHaveLength(1)
  })
})

describe('when user is in the register form from review edit', () => {
  let component: ReactWrapper<{}, {}>
  let router: ReturnType<typeof createMemoryRouter>
  beforeEach(async () => {
    const { store } = await createTestStore()
    // @ts-ignore
    const declaration = createReviewDeclaration(
      uuid(),
      mockDeclarationData,
      EventType.Birth
    )
    setScopes([SCOPES.RECORD_REGISTER], store)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(declaration))

    const form = await getReviewFormFromStore(store, EventType.Birth)

    const { component: testComponent, router: testRouter } =
      await createTestComponent(
        <RegisterForm
          registerForm={form}
          declaration={declaration}
          pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        />,
        {
          store,
          path: REVIEW_EVENT_PARENT_FORM_PAGE,
          initialEntries: [
            '/',
            formatUrl(REVIEW_EVENT_PARENT_FORM_PAGE, {
              declarationId: declaration.id,
              pageId: 'mother',
              groupId: 'mother-view-group'
            })
          ]
        }
      )
    component = testComponent
    router = testRouter
  })

  it('should redirect to review page when back button is clicked', async () => {
    const backButton = await waitForElement(component, '#back-to-review-button')
    backButton.hostNodes().simulate('click')
    component.update()
    await flushPromises()
    expect(router.state.location.pathname).toContain('/review')
  })
})

describe('when user is in the register form from sent for review edit', () => {
  let component: ReactWrapper<{}, {}>
  let testAppStore: AppStore
  beforeEach(async () => {
    Date.now = vi.fn(() => 1582525224324)
    const { store } = await createTestStore()
    // @ts-ignore
    const declaration = createReviewDeclaration(
      uuid(),
      mockDeclarationData,
      EventType.Birth,
      RegStatus.Declared
    )

    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(declaration))

    const form = await getReviewFormFromStore(store, EventType.Birth)

    const { component: testComponent } = await createTestComponent(
      <RegisterForm
        registerForm={form}
        declaration={declaration}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
      />,
      {
        store,
        path: REVIEW_EVENT_PARENT_FORM_PAGE,
        initialEntries: [
          formatUrl(REVIEW_EVENT_PARENT_FORM_PAGE, {
            declarationId: declaration.id,
            pageId: 'mother',
            groupId: 'mother-view-group'
          })
        ]
      }
    )
    component = testComponent
    testAppStore = store
  })

  it('clicking on save draft opens modal', async () => {
    const saveDraftButton = await waitForElement(component, '#save-exit-btn')
    saveDraftButton.hostNodes().simulate('click')
    component.update()
    const saveDraftConfirmationModal = await waitForElement(
      component,
      '#save_declaration_confirmation'
    )
    expect(saveDraftConfirmationModal.hostNodes()).toHaveLength(1)
  })

  it('clicking save confirm saves the draft', async () => {
    const DRAFT_MODIFY_TIME = 1582525379383
    Date.now = vi.fn(() => DRAFT_MODIFY_TIME)
    selectOption(component, '#educationalAttainment', 'Tertiary')

    // Do some modifications
    component.find('input#iD').simulate('change', {
      target: { id: 'iD', value: '1234567898' }
    })
    const saveDraftButton = await waitForElement(component, '#save-exit-btn')
    saveDraftButton.hostNodes().simulate('click')
    component.update()
    const saveDraftConfirmationModal = await waitForElement(
      component,
      '#save_declaration_confirmation'
    )

    saveDraftConfirmationModal
      .find('#confirm_save_exit')
      .hostNodes()
      .simulate('click')
    component.update()

    await flushPromises()
    const modifyTime =
      testAppStore.getState().declarationsState.declarations[0].modifiedOn

    expect(modifyTime).toBe(DRAFT_MODIFY_TIME)
  })
})

describe('When user is in Preview section death event', () => {
  let store: AppStore
  let component: TestComponentWithRouteMock
  let deathDraft: IDeclaration
  let deathForm: IForm

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store

    const draft = createDeclaration(EventType.Death)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    vi.clearAllMocks()
    // @ts-ignore
    deathDraft = createReviewDeclaration(
      uuid(),
      // @ts-ignore
      mockDeathDeclarationData,
      EventType.Death
    )
    setScopes([SCOPES.RECORD_SUBMIT_INCOMPLETE], store)
    deathDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(deathDraft))

    deathForm = await getRegisterFormFromStore(store, EventType.Death)
    const nTestComponent = await createTestComponent(
      <RegisterForm
        registerForm={deathForm}
        declaration={deathDraft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
      />,
      {
        store,
        path: DRAFT_BIRTH_PARENT_FORM_PAGE,
        initialEntries: [
          formatUrl(DRAFT_BIRTH_PARENT_FORM_PAGE, {
            declarationId: deathDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          })
        ]
      }
    )
    component = nTestComponent
  })

  it('Check if death location type is parsed properly', () => {
    expect(
      draftToGqlTransformer(
        deathForm,
        mockDeathDeclarationData as IFormData,
        deathDraft.id,
        userDetails,
        mockOfflineData,
        undefined
      ).eventLocation.type
    ).toBe('OTHER')
  })

  it('Check if death location partOf is parsed properly', () => {
    expect(
      draftToGqlTransformer(
        deathForm,
        mockDeathDeclarationData as IFormData,
        deathDraft.id,
        userDetails,
        mockOfflineData,
        undefined
      ).eventLocation.address.country
    ).toEqual('FAR')
  })

  it('Should be able to submit the form', () => {
    component.component.find('#submit_incomplete').hostNodes().simulate('click')

    const confirmBtn = component.component.find('#submit_confirm').hostNodes()
    expect(confirmBtn.length).toEqual(1)

    confirmBtn.simulate('click')
    component.component.update()

    expect(component.router.state.location.pathname).toBe(HOME)
  })

  it('Check if death location as hospital is parsed properly', () => {
    const hospitalLocatioMockDeathDeclarationData = clone(
      mockDeathDeclarationData
    )
    hospitalLocatioMockDeathDeclarationData.deathEvent.placeOfDeath =
      'HEALTH_FACILITY'
    hospitalLocatioMockDeathDeclarationData.deathEvent.deathLocation =
      '5e3736a0-090e-43b4-9012-f1cef399e123'
    expect(
      draftToGqlTransformer(
        deathForm,
        hospitalLocatioMockDeathDeclarationData as IFormData,
        '123',
        userDetails,
        mockOfflineData,
        undefined
      ).eventLocation.address
    ).toBe(undefined)
  })

  it('Check if death location as hospital _fhirID is parsed properly', () => {
    const hospitalLocatioMockDeathDeclarationData = clone(
      mockDeathDeclarationData
    )
    hospitalLocatioMockDeathDeclarationData.deathEvent.placeOfDeath =
      'HEALTH_FACILITY'
    hospitalLocatioMockDeathDeclarationData.deathEvent.deathLocation =
      '5e3736a0-090e-43b4-9012-f1cef399e123'

    expect(
      draftToGqlTransformer(
        deathForm,
        hospitalLocatioMockDeathDeclarationData as IFormData,
        '123',
        userDetails,
        mockOfflineData,
        undefined
      ).eventLocation._fhirID
    ).toBe('5e3736a0-090e-43b4-9012-f1cef399e123')
  })

  it('Check if death location is deceased parmanent address', () => {
    const mockDeathDeclaration = clone(mockDeathDeclarationData)
    mockDeathDeclaration.deathEvent.placeOfDeath = 'PRIMARY_ADDRESS'
    expect(
      draftToGqlTransformer(
        deathForm,
        mockDeathDeclaration as IFormData,
        '123',
        userDetails,
        mockOfflineData,
        undefined
      ).eventLocation.type
    ).toBe('PRIMARY_ADDRESS')
  })
})

describe('When user is in Preview section death event in offline mode', () => {
  let component: TestComponentWithRouteMock
  let deathDraft
  let deathForm: IForm
  let store: AppStore

  beforeEach(async () => {
    const testStore = await createTestStore()

    store = testStore.store

    const draft = createDeclaration(EventType.Death)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))

    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true
    })
    vi.clearAllMocks()
    // @ts-ignore
    deathDraft = createReviewDeclaration(
      uuid(),
      // @ts-ignore
      mockDeathDeclarationData,
      EventType.Death
    )

    setScopes([SCOPES.RECORD_SUBMIT_INCOMPLETE], store)
    deathDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(deathDraft))

    deathForm = await getRegisterFormFromStore(store, EventType.Death)
    const nTestComponent = await createTestComponent(
      <RegisterForm
        registerForm={deathForm}
        declaration={deathDraft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
      />,
      {
        store,
        path: DRAFT_BIRTH_PARENT_FORM_PAGE,
        initialEntries: [
          formatUrl(DRAFT_BIRTH_PARENT_FORM_PAGE, {
            declarationId: deathDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          })
        ]
      }
    )
    component = nTestComponent
  })

  it('Should be able to submit the form', async () => {
    component.component.find('#submit_incomplete').hostNodes().simulate('click')

    const confirmBtn = component.component.find('#submit_confirm').hostNodes()
    expect(confirmBtn.length).toEqual(1)

    confirmBtn.simulate('click')
    component.component.update()

    expect(component.router.state.location.pathname).toBe(HOME)
  })
})

describe('When user is in Preview section marriage event', () => {
  let store: AppStore

  let component: TestComponentWithRouteMock
  let marriageDraft
  let marriageForm: IForm

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store

    const draft = createDeclaration(EventType.Death)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    vi.clearAllMocks()
    // @ts-ignore
    marriageDraft = createReviewDeclaration(
      uuid(),
      // @ts-ignore
      mockDeathDeclarationData,
      EventType.Marriage
    )

    setScopes([SCOPES.RECORD_SUBMIT_INCOMPLETE], store)
    marriageDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(marriageDraft))

    marriageForm = await getRegisterFormFromStore(store, EventType.Marriage)

    const nTestComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        registerForm={marriageForm}
        declaration={marriageDraft}
        pageRoute={DRAFT_MARRIAGE_FORM_PAGE}
      />,
      {
        store,
        path: DRAFT_MARRIAGE_FORM_PAGE,
        initialEntries: [
          formatUrl(DRAFT_MARRIAGE_FORM_PAGE, {
            declarationId: marriageDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          })
        ]
      }
    )
    component = nTestComponent
  })

  it('Check if marriage location partOf is parsed properly', () => {
    expect(
      draftToGqlTransformer(
        marriageForm,
        mockMarriageDeclarationData as unknown as IFormData,
        '123',
        userDetails,
        mockOfflineData,
        undefined
      ).eventLocation.address.country
    ).toEqual('FAR')
  })

  it('Check if data has witnessOne', () => {
    expect(
      draftToGqlTransformer(
        marriageForm,
        mockMarriageDeclarationData as unknown as IFormData,
        '123',
        userDetails,
        mockOfflineData,
        undefined
      ).witnessOne._fhirID
    ).toEqual('36972633-1c80-4fb4-a636-17f7dc9c2e14')
  })

  it('Should be able to submit the form', () => {
    component.component.find('#submit_incomplete').hostNodes().simulate('click')

    const confirmBtn = component.component.find('#submit_confirm').hostNodes()
    expect(confirmBtn.length).toEqual(1)

    confirmBtn.simulate('click')
    component.component.update()

    expect(component.router.state.location.pathname).toBe(HOME)
  })
})
