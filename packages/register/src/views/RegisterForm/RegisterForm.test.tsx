import * as React from 'react'
import {
  createTestComponent,
  selectOption,
  mockApplicationData
} from 'src/tests/util'
import { RegisterForm } from './RegisterForm'
import { ReactWrapper } from 'enzyme'
import {
  createDraft,
  createReviewDraft,
  storeDraft,
  setInitialDrafts
} from 'src/drafts'
import { v4 as uuid } from 'uuid'

import { createStore } from '../../store'
import {
  DRAFT_BIRTH_PARENT_FORM_TAB,
  REVIEW_BIRTH_PARENT_FORM_TAB
} from '@opencrvs/register/src/navigation/routes'
import { getRegisterForm } from '@opencrvs/register/src/forms/register/application-selectors'
import { getReviewForm } from '@opencrvs/register/src/forms/register/review-selectors'
import { Event } from '@opencrvs/register/src/forms'

describe('when user is in the register form before initial draft load', () => {
  const { store, history } = createStore()

  const mock: any = jest.fn()
  const draft = createDraft(Event.BIRTH)
  const form = getRegisterForm(store.getState())[Event.BIRTH]
  it('throws error when draft not found after initial drafts load', () => {
    try {
      createTestComponent(
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
          match={{
            params: { draftId: '', tabId: '' },
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

describe('when user is in the register form', async () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.BIRTH)
  const initalDrafts = JSON.parse('[]')
  store.dispatch(setInitialDrafts(initalDrafts))
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()
  const form = getRegisterForm(store.getState())[Event.BIRTH]

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          history={history}
          staticContext={mock}
          registerForm={form}
          draft={draft}
          tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
          match={{
            params: { draftId: draft.id, tabId: 'mother' },
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
        component.find('#form_section_title_mother').hostNodes()
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
    it('takes user to declaration submitted page when save button is clicked', () => {
      component
        .find('#save_draft')
        .hostNodes()
        .simulate('click')
      expect(history.location.pathname).toEqual('/saved')
    })
  })
})

describe('when user is in the register form preview section', () => {
  const { store, history } = createStore()
  const draft = createDraft(Event.BIRTH)
  const initalDrafts = JSON.parse('[]')
  store.dispatch(setInitialDrafts(initalDrafts))
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()
  const form = getRegisterForm(store.getState())[Event.BIRTH]
  const testComponent = createTestComponent(
    <RegisterForm
      location={mock}
      history={history}
      staticContext={mock}
      registerForm={form}
      draft={draft}
      tabRoute={DRAFT_BIRTH_PARENT_FORM_TAB}
      match={{
        params: { draftId: draft.id, tabId: 'preview' },
        isExact: true,
        path: '',
        url: ''
      }}
    />,
    store
  )
  component = testComponent.component

  it('submit button will be disabled when form is not fully filled-up', () => {
    expect(
      component
        .find('#submit_form')
        .hostNodes()
        .prop('disabled')
    ).toBe(true)
  })

  it('Do not displays submit confirm modal when disabled submit button is clicked', () => {
    component
      .find('#submit_form')
      .hostNodes()
      .simulate('click')

    expect(component.find('#submit_confirm').hostNodes()).toHaveLength(0)
  })
})

describe('when user is in the register form review section', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store, history } = createStore()
    const draft = createReviewDraft(uuid(), mockApplicationData, Event.BIRTH)
    const initalDrafts = JSON.parse('[]')
    store.dispatch(setInitialDrafts(initalDrafts))
    store.dispatch(storeDraft(draft))
    const mock: any = jest.fn()
    const form = getReviewForm(store.getState())
    const testComponent = createTestComponent(
      <RegisterForm
        location={mock}
        history={history}
        staticContext={mock}
        registerForm={form}
        draft={draft}
        tabRoute={REVIEW_BIRTH_PARENT_FORM_TAB}
        match={{
          params: { draftId: draft.id, tabId: 'review' },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent.component
  })

  it('clicking the reject button launches the reject form action page', () => {
    component
      .find('#next_button_child')
      .hostNodes()
      .simulate('click')

    component
      .find('#next_button_mother')
      .hostNodes()
      .simulate('click')

    component
      .find('#next_button_father')
      .hostNodes()
      .simulate('click')

    component
      .find('#rejectApplicationBtn')
      .hostNodes()
      .simulate('click')
    expect(
      component.find('#reject-registration-form-container').hostNodes()
    ).toHaveLength(1)
  })
})
