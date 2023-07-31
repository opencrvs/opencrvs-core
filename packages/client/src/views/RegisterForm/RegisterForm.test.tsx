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
  mockDeclarationData,
  mockDeathDeclarationData,
  mockMarriageDeclarationData,
  mockDeathDeclarationDataWithoutFirstNames,
  getRegisterFormFromStore,
  getReviewFormFromStore,
  createTestStore,
  flushPromises
} from '@client/tests/util'
import { RegisterForm } from '@client/views/RegisterForm/RegisterForm'
import { ReactWrapper } from 'enzyme'
import {
  createDeclaration,
  createReviewDeclaration,
  storeDeclaration,
  setInitialDeclarations,
  SUBMISSION_STATUS,
  modifyDeclaration
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
import { Event } from '@client/utils/gateway'
import { draftToGqlTransformer } from '@client/transformer'
import { IForm } from '@client/forms'
import { clone, cloneDeep } from 'lodash'
import { formMessages as messages } from '@client/i18n/messages'
import * as profileSelectors from '@client/profile/profileSelectors'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { waitForElement } from '@client/tests/wait-for-element'
import { History } from 'history'
import { DECLARED } from '@client/utils/constants'
import { vi } from 'vitest'
import { createClient } from '@client/utils/apolloClient'
import { ApolloClient } from '@apollo/client'

describe('when user is in the register form for birth event', () => {
  let component: ReactWrapper<{}, {}>

  let store: AppStore
  let history: History
  let client: ApolloClient<{}>

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const storeContext = await createTestStore()
      store = storeContext.store
      history = storeContext.history
      client = createClient(store)

      const draft = createDeclaration(Event.Birth)
      store.dispatch(storeDeclaration(draft))
      store.dispatch(setInitialDeclarations())
      store.dispatch(storeDeclaration(draft))

      const mock: any = vi.fn()
      const form = await getRegisterFormFromStore(store, Event.Birth)
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          declaration={draft}
          pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP}
          match={{
            params: {
              declarationId: draft.id,
              pageId: 'mother',
              groupId: 'mother-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history, apolloClient: client }
      )
      component = testComponent
    })
    it('takes field agent to declaration submitted page when save button is clicked', async () => {
      localStorage.getItem = vi.fn(
        (key: string) =>
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJkZWNsYXJlIiwiZGVtbyJdLCJpYXQiOjE1NjMyNTYyNDIsImV4cCI6MTU2Mzg2MTA0MiwiYXVkIjpbIm9wZW5jcnZzOmF1dGgtdXNlciIsIm9wZW5jcnZzOnVzZXItbWdudC11c2VyIiwib3BlbmNydnM6aGVhcnRoLXVzZXIiLCJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJvcGVuY3J2czpub3RpZmljYXRpb24tdXNlciIsIm9wZW5jcnZzOndvcmtmbG93LXVzZXIiLCJvcGVuY3J2czpzZWFyY2gtdXNlciIsIm9wZW5jcnZzOm1ldHJpY3MtdXNlciIsIm9wZW5jcnZzOnJlc291cmNlcy11c2VyIl0sImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjVkMWM1YTJhNTgxNjM0MDBlZjFkMDEyOSJ9.hZu0em2JA0sl-5uzck4mn4HfYdzxSmgoERA8SbWRPXEmriSYjs4PEPk9StXF_Ed5kd53VlNF9xf39DDGWqyyn76gpcMPbHJAL8nqLV82hot8fgU1WtEk865U8-9oAxaVmxAsjpHayiuD6zfKuR-ixrLFdoRKP13LdORktFCQe5e7To2w7vXArjUb6SDpSHST4Fbkhg8vzOcykweSGiNlmoEVtLzkpamS6fcTGRHkNpb_Wk_AQW9TAdw6NqG5lDEAO10auNgJpKxO8X-DQKhvEfY5TbpblR51L_U8pUXpDCAvGegMLnwmfAIoH1hMj--Wd2JhqgUvj0YrlDKI99fntA'
      )
      component.find('#save_draft').hostNodes().simulate('click')
      await flushPromises()
      expect(history.location.pathname).toEqual('/registration-home/progress/')
    })
    it('takes registrar to declaration submitted page when save button is clicked', async () => {
      localStorage.getItem = vi.fn(
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

  const mock: any = vi.fn()
  let form: IForm
  let store: AppStore
  let history: History
  let draft: ReturnType<typeof createDeclaration>

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history
    const mock: any = vi.fn()
    draft = createDeclaration(Event.Death)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    form = await getRegisterFormFromStore(store, Event.Death)
  })
  describe('when user is in optional cause of death section', () => {
    beforeEach(async () => {
      const clonedForm = cloneDeep(form)
      clonedForm.sections[2].optional = true
      // TODO: need to check if causeOfDeathNotice is needed or not
      // clonedForm.sections[2].notice = messages.causeOfDeathNotice
      clonedForm.sections[2].groups[0].ignoreSingleFieldView = true
      const mock: any = vi.fn()
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={clonedForm}
          declaration={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: {
              declarationId: draft.id,
              pageId: 'deathEvent',
              groupId: 'death-event-details'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = testComponent
    })

    it('renders the deathEvent details page', () => {
      expect(
        component.find('#form_section_id_death-event-details').hostNodes()
      ).toHaveLength(1)
    })
  })
  describe('when user is in contact point page', () => {
    it('shows error if click continue without any value', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          declaration={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { declarationId: draft.id, pageId: '', groupId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = testComponent
      component.find('#next_section').hostNodes().simulate('click')
      await waitForElement(component, '#informantType_error')
      expect(component.find('#informantType_error').hostNodes().text()).toBe(
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
          declaration={draft}
          pageRoute={DRAFT_DEATH_FORM_PAGE}
          match={{
            params: { declarationId: draft.id, pageId: '', groupId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = testComponent
      component.find('#crcl-btn').hostNodes().simulate('click')

      component.update()

      expect(history.location.pathname).toContain('/')
    })
  })
})

describe('when user is in the register form for marriage event', () => {
  let component: ReactWrapper<{}, {}>

  const mock: any = vi.fn()
  let form: IForm
  let store: AppStore
  let history: History
  let draft: ReturnType<typeof createDeclaration>

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history
    const mock: any = vi.fn()
    draft = createDeclaration(Event.Marriage)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    form = await getRegisterFormFromStore(store, Event.Marriage)
  })
  describe('when user is in marriage section', () => {
    beforeEach(async () => {
      const clonedForm = cloneDeep(form)
      clonedForm.sections[2].optional = true
      clonedForm.sections[2].groups[0].ignoreSingleFieldView = true
      const mock: any = vi.fn()
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={clonedForm}
          declaration={draft}
          pageRoute={DRAFT_MARRIAGE_FORM_PAGE}
          match={{
            params: {
              declarationId: draft.id,
              pageId: 'marriageEvent',
              groupId: 'marriage-event-details'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = testComponent
    })

    it('renders the marriageEvent details page', () => {
      expect(
        component.find('#form_section_id_marriage-event-details').hostNodes()
      ).toHaveLength(1)
    })
  })
  describe('when user is in contact point page', () => {
    it('shows error if click continue without any value', async () => {
      const testComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          declaration={draft}
          pageRoute={DRAFT_MARRIAGE_FORM_PAGE}
          match={{
            params: { declarationId: draft.id, pageId: '', groupId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = testComponent
      component.find('#next_section').hostNodes().simulate('click')
      await waitForElement(component, '#informantType_error')
      expect(component.find('#informantType_error').hostNodes().text()).toBe(
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
          declaration={draft}
          pageRoute={DRAFT_MARRIAGE_FORM_PAGE}
          match={{
            params: { declarationId: draft.id, pageId: '', groupId: '' },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = testComponent
      component.find('#crcl-btn').hostNodes().simulate('click')

      component.update()

      expect(history.location.pathname).toContain('/')
    })
  })
})

describe('when user is in the register form preview section', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History
  const mock = vi.fn()

  beforeEach(async () => {
    mock.mockReset()
    const storeContext = await createTestStore()
    store = storeContext.store
    history = storeContext.history

    const draft = createDeclaration(Event.Birth)
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
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))

    const form = await getRegisterFormFromStore(store, Event.Birth)
    const testComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        history={history}
        registerForm={form}
        declaration={draft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: draft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
    )
    component = testComponent
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
      const nDeclaration = createReviewDeclaration(
        uuid(),
        mockDeclarationData,
        Event.Birth
      )
      nDeclaration.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      store.dispatch(setInitialDeclarations())
      store.dispatch(storeDeclaration(nDeclaration))

      const nform = getRegisterForm(store.getState())[Event.Birth]
      const nTestComponent = await createTestComponent(
        // @ts-ignore
        <RegisterForm
          history={history}
          registerForm={nform}
          declaration={nDeclaration}
          pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
          match={{
            params: {
              declarationId: nDeclaration.id,
              pageId: 'preview',
              groupId: 'preview-view-group'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = nTestComponent
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
    const declaration = createReviewDeclaration(
      uuid(),
      mockDeclarationData,
      Event.Birth
    )
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(declaration))
    const mock: any = vi.fn()
    vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])

    const form = await getReviewFormFromStore(store, Event.Birth)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        declaration={declaration}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'review',
            groupId: 'review-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
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
  beforeEach(async () => {
    const { store, history } = await createTestStore()
    // @ts-ignore
    const declaration = createReviewDeclaration(
      uuid(),
      mockDeclarationData,
      Event.Birth
    )
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(declaration))
    const mock: any = vi.fn()
    vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])

    const form = await getReviewFormFromStore(store, Event.Birth)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        declaration={declaration}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'mother',
            groupId: 'mother-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
    )
    component = testComponent
  })

  it('should redirect to progress tab when close declaration button is clicked', async () => {
    const menuButton = await waitForElement(
      component,
      '#eventToggleMenuToggleButton'
    )
    menuButton.hostNodes().simulate('click')
    component.update()
    const closeDeclarationButton = await waitForElement(
      component,
      '#eventToggleMenuItem0'
    )
    closeDeclarationButton.hostNodes().simulate('click')
    component.update()
    expect(window.location.href).toContain('/progress')
  })
})

describe('when user is in the register form from sent for review edit', () => {
  let component: ReactWrapper<{}, {}>
  let testAppStore: AppStore
  beforeEach(async () => {
    Date.now = vi.fn(() => 1582525224324)
    const { store, history } = await createTestStore()
    // @ts-ignore
    const declaration = createReviewDeclaration(
      uuid(),
      mockDeclarationData,
      Event.Birth,
      DECLARED
    )
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(declaration))
    const mock: any = vi.fn()
    vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['register'])

    const form = await getReviewFormFromStore(store, Event.Birth)

    const testComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        declaration={declaration}
        pageRoute={REVIEW_EVENT_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: declaration.id,
            pageId: 'mother',
            groupId: 'mother-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
    )
    component = testComponent
    testAppStore = store
  })

  it('clicking on save draft opens modal', async () => {
    const saveDraftButton = await waitForElement(component, '#save_draft')
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
    const saveDraftButton = await waitForElement(component, '#save_draft')
    saveDraftButton.hostNodes().simulate('click')
    component.update()
    const saveDraftConfirmationModal = await waitForElement(
      component,
      '#save_declaration_confirmation'
    )

    saveDraftConfirmationModal
      .find('#confirm_save')
      .hostNodes()
      .simulate('click')
    component.update()

    const modifyTime =
      testAppStore.getState().declarationsState.declarations[0].modifiedOn

    expect(modifyTime).toBe(DRAFT_MODIFY_TIME)
  })
})

describe('When user is in Preview section death event', () => {
  let store: AppStore
  let history: History
  let component: ReactWrapper<{}, {}>
  let deathDraft
  let deathForm: IForm

  const mock: any = vi.fn()

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history

    const draft = createDeclaration(Event.Death)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    vi.clearAllMocks()
    // @ts-ignore
    deathDraft = createReviewDeclaration(
      uuid(),
      // @ts-ignore
      mockDeathDeclarationData,
      Event.Death
    )
    deathDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(deathDraft))

    vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['declare'])

    deathForm = await getRegisterFormFromStore(store, Event.Death)
    const nTestComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={deathForm}
        declaration={deathDraft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: deathDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
    )
    component = nTestComponent
  })

  it('Check if death location type is parsed properly', () => {
    expect(
      draftToGqlTransformer(deathForm, mockDeathDeclarationData as IFormData)
        .eventLocation.type
    ).toBe('OTHER')
  })

  it('Check if death location partOf is parsed properly', () => {
    expect(
      draftToGqlTransformer(deathForm, mockDeathDeclarationData as IFormData)
        .eventLocation.address.country
    ).toEqual('FAR')
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
        hospitalLocatioMockDeathDeclarationData as IFormData
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
        hospitalLocatioMockDeathDeclarationData as IFormData
      ).eventLocation._fhirID
    ).toBe('5e3736a0-090e-43b4-9012-f1cef399e123')
  })

  it('Check if death location is deceased parmanent address', () => {
    const mockDeathDeclaration = clone(mockDeathDeclarationData)
    mockDeathDeclaration.deathEvent.placeOfDeath = 'PRIMARY_ADDRESS'
    expect(
      draftToGqlTransformer(deathForm, mockDeathDeclaration as IFormData)
        .eventLocation.type
    ).toBe('PRIMARY_ADDRESS')
  })
})

describe('When user is in Preview section death event in offline mode', () => {
  let component: ReactWrapper<{}, {}>
  let deathDraft
  let deathForm: IForm
  let store: AppStore
  let history: History

  const mock: any = vi.fn()

  beforeEach(async () => {
    const testStore = await createTestStore()
    history = testStore.history
    store = testStore.store

    const draft = createDeclaration(Event.Death)
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
      mockDeathDeclarationDataWithoutFirstNames,
      Event.Death
    )
    deathDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(deathDraft))

    deathForm = await getRegisterFormFromStore(store, Event.Death)
    const nTestComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={deathForm}
        declaration={deathDraft}
        pageRoute={DRAFT_BIRTH_PARENT_FORM_PAGE}
        match={{
          params: {
            declarationId: deathDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
    )
    component = nTestComponent
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

describe('When user is in Preview section marriage event', () => {
  let store: AppStore
  let history: History
  let component: ReactWrapper<{}, {}>
  let marriageDraft
  let marriageForm: IForm

  const mock: any = vi.fn()

  beforeEach(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history

    const draft = createDeclaration(Event.Death)
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(draft))
    vi.clearAllMocks()
    // @ts-ignore
    marriageDraft = createReviewDeclaration(
      uuid(),
      // @ts-ignore
      mockDeathDeclarationData,
      Event.Marriage
    )
    marriageDraft.submissionStatus = SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
    store.dispatch(setInitialDeclarations())
    store.dispatch(storeDeclaration(marriageDraft))

    vi.spyOn(profileSelectors, 'getScope').mockReturnValue(['declare'])

    marriageForm = await getRegisterFormFromStore(store, Event.Marriage)
    const nTestComponent = await createTestComponent(
      // @ts-ignore
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={marriageForm}
        declaration={marriageDraft}
        pageRoute={DRAFT_MARRIAGE_FORM_PAGE}
        match={{
          params: {
            declarationId: marriageDraft.id,
            pageId: 'preview',
            groupId: 'preview-view-group'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      { store, history }
    )
    component = nTestComponent
  })

  it('Check if marriage location partOf is parsed properly', () => {
    expect(
      draftToGqlTransformer(
        marriageForm,
        mockMarriageDeclarationData as unknown as IFormData
      ).eventLocation.address.country
    ).toEqual('FAR')
  })

  it('Check if data has witnessOne', () => {
    expect(
      draftToGqlTransformer(
        marriageForm,
        mockMarriageDeclarationData as unknown as IFormData
      ).witnessOne._fhirID
    ).toEqual('36972633-1c80-4fb4-a636-17f7dc9c2e14')
  })

  it('Should be able to submit the form', () => {
    component.find('#submit_form').hostNodes().simulate('click')

    const confirmBtn = component.find('#submit_confirm').hostNodes()
    expect(confirmBtn.length).toEqual(1)

    confirmBtn.simulate('click')
    component.update()

    expect(history.location.pathname).toBe(HOME)
  })
})
