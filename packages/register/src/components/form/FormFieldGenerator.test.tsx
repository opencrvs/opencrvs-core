import * as React from 'react'
import { createTestComponent, selectOption } from '@register/tests/util'
import { FormFieldGenerator } from '@register/components/form/FormFieldGenerator'
import { ReactWrapper } from 'enzyme'
import { createApplication, storeApplication } from '@register/applications'
import { createStore } from '@register/store'
import {
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  TEL,
  Event,
  RADIO_GROUP_WITH_NESTED_FIELDS
} from '@register/forms'
import { countries } from '@register/forms/countries'
import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'

import { formMessages } from '@register/i18n/messages'
import { waitForElement } from '@register/tests/wait-for-element'
import { phoneNumberFormat } from '@register/utils/validate'

export interface IMotherSectionFormData {
  firstName: string
}

describe('form component', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()
    const draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))
    const modifyDraft = jest.fn()
    const testComponent = await createTestComponent(
      <FormFieldGenerator
        id="mother"
        onChange={modifyDraft}
        setAllFieldsDirty={false}
        fields={[
          {
            name: 'countryPermanent',
            type: SELECT_WITH_OPTIONS,
            label: formMessages.country,
            required: true,
            initialValue: window.config.COUNTRY.toUpperCase(),
            validate: [],
            options: countries
          },
          {
            name: 'statePermanent',
            type: SELECT_WITH_DYNAMIC_OPTIONS,
            label: formMessages.state,
            required: true,
            initialValue: '',
            validate: [],
            dynamicOptions: {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'countryPermanent'
            }
          },
          {
            name: 'districtPermanent',
            type: SELECT_WITH_DYNAMIC_OPTIONS,
            label: formMessages.district,
            required: true,
            initialValue: '',
            placeholder: formMessages.select,
            validate: [],
            dynamicOptions: {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'statePermanent'
            }
          },
          {
            name: 'phone',
            type: TEL,
            label: formMessages.district,
            required: true,
            initialValue: '',
            validate: []
          }
        ]}
      />,
      store
    )
    component = testComponent.component
  })
  describe('when user is in the moth​​er section', () => {
    it('renders the page', async () => {
      const label = await waitForElement(component, '#countryPermanent_label')
      expect(label.hostNodes()).toHaveLength(1)
    })
    it('changes the state select', async () => {
      const select = selectOption(component, '#statePermanent', 'Barisal')
      expect(select.text()).toEqual('Barisal')
    })
    it('changes the district select', async () => {
      selectOption(component, '#statePermanent', 'Barisal')
      const select = selectOption(component, '#districtPermanent', 'BARGUNA')
      expect(select.text()).toEqual('BARGUNA')
    })
    describe('when resetDependentSelectValues is called', () => {
      beforeEach(() => {
        const instance = component
          .find('FormSectionComponent')
          .instance() as any
        instance.resetDependentSelectValues('statePermanent')
      })
      it('resets dependent select fields', () => {
        expect(
          component
            .find('#districtPermanent')
            .hostNodes()
            .text()
        ).toEqual('Select')
      })
      it('doesnt reset non dependent select fields', () => {
        expect(
          component
            .find('#countryPermanent')
            .hostNodes()
            .text()
        ).toEqual('Bangladesh')
      })
    })
  })
})

describe('when user is in the register section', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store } = createStore()
    const draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))
    const modifyDraft = jest.fn()
    const testComponent = await createTestComponent(
      <FormFieldGenerator
        id="registration"
        onChange={modifyDraft}
        setAllFieldsDirty={false}
        fields={[
          {
            name: 'registrationPhone',
            type: TEL,
            label: {
              defaultMessage: 'Phone number',
              id: 'form.field.label.application.phone',
              description: 'Input label for phone input'
            },
            required: true,
            initialValue: '',
            validate: []
          }
        ]}
      />,
      store
    )
    component = testComponent.component
  })
  it('renders registration phone type as tel', () => {
    expect(
      component
        .find('#registrationPhone')
        .hostNodes()
        .prop('type')
    ).toEqual('tel')
  })
})

describe('when field definition has nested fields', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()
    const draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))
    const modifyDraft = jest.fn()
    const testComponent = await createTestComponent(
      <FormFieldGenerator
        id="registration"
        onChange={modifyDraft}
        setAllFieldsDirty={false}
        fields={[
          {
            name: 'applicant',
            type: RADIO_GROUP_WITH_NESTED_FIELDS,
            label: {
              defaultMessage: 'Applicant',
              description: 'Form section name for Applicant',
              id: 'form.section.applicant.name'
            },
            required: true,
            initialValue: '',
            validate: [],
            options: [
              {
                value: 'FATHER',
                label: {
                  defaultMessage: 'Father',
                  description: 'Label for option Father',
                  id: 'form.field.label.applicantRelation.father'
                }
              },
              {
                value: 'MOTHER',
                label: {
                  defaultMessage: 'Mother',
                  description: 'Label for option Mother',
                  id: 'form.field.label.applicantRelation.mother'
                }
              }
            ],
            nestedFields: {
              FATHER: [
                {
                  name: 'applicantPhoneFather',
                  type: TEL,
                  label: {
                    defaultMessage: 'Phone number',
                    description: 'Input label for phone input',
                    id: 'form.field.label.phoneNumber'
                  },
                  required: false,
                  initialValue: '',
                  validate: [phoneNumberFormat]
                }
              ],
              MOTHER: [
                {
                  name: 'applicantPhoneMother',
                  type: TEL,
                  label: {
                    defaultMessage: 'Phone number',
                    description: 'Input label for phone input',
                    id: 'form.field.label.phoneNumber'
                  },
                  required: false,
                  initialValue: '',
                  validate: [phoneNumberFormat]
                }
              ]
            }
          }
        ]}
      />,
      store
    )

    component = testComponent.component
  })

  it('renders radio group with nested fields', () => {
    expect(component.find('#applicant').length).toBeGreaterThanOrEqual(1)
  })

  it('when clicking on a radio option renders nested fields', () => {
    component
      .find('#applicant_MOTHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })
    component.update()

    expect(
      component.find(
        'input[name="applicant.nestedFields.applicantPhoneMother"]'
      )
    ).toHaveLength(1)
  })

  it('changing radio button resets nested field values', () => {
    component
      .find('#applicant_MOTHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })

    component
      .find('input[name="applicant.nestedFields.applicantPhoneMother"]')
      .simulate('change', {
        target: {
          name: 'applicant.nestedFields.applicantPhoneMother',
          value: '01912345678'
        }
      })

    expect(
      component
        .find('input[name="applicant.nestedFields.applicantPhoneMother"]')
        .props().value
    ).toEqual('01912345678')

    component
      .find('#applicant_FATHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })

    component
      .find('#applicant_MOTHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })

    expect(
      component
        .find('input[name="applicant.nestedFields.applicantPhoneMother"]')
        .props().value
    ).toEqual('')
  })
})
