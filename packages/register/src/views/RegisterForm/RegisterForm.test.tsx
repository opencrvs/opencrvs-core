import * as React from 'react'
import { createTestComponent, selectOption } from 'src/tests/util'
import { RegisterForm } from './RegisterForm'
import { ReactWrapper } from 'enzyme'
import { createDraft, storeDraft, setInitialDrafts } from 'src/drafts'
import { IntlProvider } from 'react-intl'
import { createStore } from '../../store'

describe('when user is in the register form before initial draft load', () => {
  const { store, history } = createStore()
  const intlProvider = new IntlProvider({ locale: 'en' }, {})
  const { intl } = intlProvider.getChildContext()
  const mock: any = jest.fn()
  it('throws error when draft not found after initial drafts load', () => {
    try {
      createTestComponent(
        <RegisterForm
          location={mock}
          intl={intl}
          history={history}
          staticContext={mock}
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
  const draft = createDraft()
  const initalDrafts = JSON.parse('[]')
  store.dispatch(setInitialDrafts(initalDrafts))
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>
  const intlProvider = new IntlProvider({ locale: 'en' }, {})
  const { intl } = intlProvider.getChildContext()
  const mock: any = jest.fn()

  describe('when user is in the child section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          intl={intl}
          history={history}
          staticContext={mock}
          match={{
            params: { draftId: draft.id, tabId: 'child' },
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
        component.find('#form_section_title_child').hostNodes()
      ).toHaveLength(1)
    })
    it('changes the gender select', async () => {
      const select = selectOption(component, '#gender', 'Male')
      expect(component.find(select).text()).toEqual('Male')
    })
    it('changes the attendant at birth select', async () => {
      const select = selectOption(component, '#attendantAtBirth', 'Nurse')
      expect(component.find(select).text()).toEqual('Nurse')
    })
    it('changes type of birth select', async () => {
      const select = selectOption(component, '#typeOfBirth', 'Twin')
      expect(component.find(select).text()).toEqual('Twin')
    })
    it('changes place of delivery select', async () => {
      const select = selectOption(component, '#placeOfDelivery', 'Hospital')
      expect(component.find(select).text()).toEqual('Hospital')
    })
  })

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <RegisterForm
          location={mock}
          intl={intl}
          history={history}
          staticContext={mock}
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
        '#country',
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
  const draft = createDraft()
  const initalDrafts = JSON.parse('[]')
  store.dispatch(setInitialDrafts(initalDrafts))
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>
  const intlProvider = new IntlProvider({ locale: 'en' }, {})
  const { intl } = intlProvider.getChildContext()
  const mock: any = jest.fn()
  const testComponent = createTestComponent(
    <RegisterForm
      location={mock}
      intl={intl}
      history={history}
      staticContext={mock}
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

  describe('when user is in the preview section', () => {
    const data = {
      child: {
        attendantAtBirth: 'NURSE',
        childBirthDate: '1999-10-10',
        deliveryAddress: '',
        deliveryInstitution: '',
        familyName: 'পারিবারিক নাম',
        familyNameEng: 'family name',
        firstNames: 'নামের প্রথমাংশ',
        firstNamesEng: 'first name',
        gender: 'male',
        orderOfBirth: '2',
        placeOfDelivery: 'HOSPITAL',
        typeOfBirth: 'SINGLE',
        weightAtBirth: '10'
      },
      father: {
        addressLine1: '',
        addressLine1Permanent: '',
        addressLine2: '',
        addressLine2Permanent: '',
        addressLine3Options1: '',
        addressLine3Options1Permanent: '',
        addressLine4: '',
        addressLine4Permanent: '',
        addressSameAsMother: true,
        fatherBirthDate: '1999-10-10',
        country: 'BGD',
        countryPermanent: 'BGD',
        currentAddress: '',
        dateOfMarriage: '2010-10-10',
        district: '',
        districtPermanent: '',
        educationalAttainment: 'PRIMARY_ISCED_1',
        familyName: 'পারিবারিক নাম',
        familyNameEng: 'family name',
        fathersDetailsExist: true,
        firstNames: 'নামের প্রথমাংশ',
        firstNamesEng: 'first name',
        iD: '234234423424234244',
        iDType: 'NATIONAL_ID',
        maritalStatus: 'WIDOWED',
        nationality: 'BGD',
        permanentAddress: '',
        permanentAddressSameAsMother: true,
        postCode: '',
        postCodePermanent: '',
        state: '',
        statePermanent: ''
      },
      mother: {
        addressLine1: 'Rd #10',
        addressLine1Permanent: 'Rd#10',
        addressLine2: 'vil',
        addressLine2Permanent: 'Vil',
        addressLine3Options1: 'union1',
        addressLine3Options1Permanent: 'union1',
        addressLine4: 'upazila10',
        addressLine4Permanent: 'upazila10',
        motherBirthDate: '1999-10-10',
        country: 'BGD',
        countryPermanent: 'BGD',
        currentAddress: '',
        dateOfMarriage: '2010-10-10',
        district: 'district2',
        districtPermanent: 'district2',
        educationalAttainment: 'PRIMARY_ISCED_1',
        familyName: 'পারিবারিক নাম',
        familyNameEng: 'family name',
        firstNames: 'নামের প্রথমাংশ',
        firstNamesEng: 'first name',
        iD: '234243453455',
        iDType: 'NATIONAL_ID',
        maritalStatus: 'MARRIED',
        nationality: 'BGD',
        permanentAddress: '',
        postCode: '1020',
        postCodePermanent: '1010',
        state: 'state4',
        statePermanent: 'state4'
      },
      registration: {
        commentsOrNotes: 'comments',
        paperFormNumber: '423424245455',
        presentAtBirthRegistration: 'MOTHER_ONLY',
        registrationCertificateLanguage: ['en'],
        registrationEmail: 'gmail@gmail.com',
        registrationPhone: '01736478884',
        whoseContactDetails: 'MOTHER'
      }
    }

    const customDraft = { id: Date.now(), data }
    store.dispatch(storeDraft(customDraft))

    const testComponent2 = createTestComponent(
      <RegisterForm
        location={mock}
        intl={intl}
        history={history}
        staticContext={mock}
        match={{
          params: { draftId: customDraft.id, tabId: 'preview' },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )
    component = testComponent2.component
  })

  it('Enable submit button after fillin-up the whole form with dummy data', () => {
    expect(
      component
        .find('#submit_form')
        .hostNodes()
        .prop('disabled')
    ).toBe(true)
  })
})
