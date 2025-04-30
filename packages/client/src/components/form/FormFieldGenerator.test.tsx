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
  selectOption,
  flushPromises,
  resizeWindow,
  createTestComponent
} from '@client/tests/util'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { ReactWrapper } from 'enzyme'
import { createDeclaration, storeDeclaration } from '@client/declarations'
import { createStore } from '@client/store'
import {
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  TEL,
  BIG_NUMBER,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  LOCATION_SEARCH_INPUT,
  DATE,
  NUMBER
} from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { countries } from '@client/utils/countries'
import { OFFLINE_LOCATIONS_KEY } from '@client/offline/reducer'
import { formMessages } from '@client/i18n/messages'
import { waitForElement } from '@client/tests/wait-for-element'
import { phoneNumberFormat, dateNotInFuture } from '@client/utils/validate'
import { vi } from 'vitest'

describe('form component', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()
    const draft = createDeclaration(EventType.Birth)
    store.dispatch(storeDeclaration(draft))
    const modifyDraft = vi.fn()
    const { component: testComponent } = await createTestComponent(
      <FormFieldGenerator
        id="mother"
        onChange={modifyDraft}
        setAllFieldsDirty={false}
        draftData={draft.data}
        fields={[
          {
            name: 'countryPrimary',
            type: SELECT_WITH_OPTIONS,
            label: formMessages.country,
            required: true,
            initialValue: window.config.COUNTRY.toUpperCase(),
            validator: [],
            options: countries
          },
          {
            name: 'statePrimary',
            type: SELECT_WITH_DYNAMIC_OPTIONS,
            label: formMessages.state,
            required: true,
            initialValue: '',
            validator: [],
            dynamicOptions: {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'countryPrimary'
            }
          },
          {
            name: 'districtPrimary',
            type: SELECT_WITH_DYNAMIC_OPTIONS,
            label: formMessages.district,
            required: true,
            initialValue: '',
            placeholder: formMessages.select,
            validator: [],
            dynamicOptions: {
              resource: OFFLINE_LOCATIONS_KEY,
              dependency: 'statePrimary'
            }
          },
          {
            name: 'phone',
            type: TEL,
            label: formMessages.district,
            required: true,
            initialValue: '',
            validator: []
          },
          {
            name: 'identifier',
            type: BIG_NUMBER,
            label: formMessages.NID,
            required: true,
            initialValue: '',
            validator: []
          }
        ]}
      />,
      {
        store
      }
    )

    component = testComponent
  })
  describe('when user is in the moth​​er section', () => {
    it('renders the page', async () => {
      const label = await waitForElement(component, '#countryPrimary_label')
      expect(label.hostNodes()).toHaveLength(1)
    })
    it('changes the state select', async () => {
      const select = selectOption(component, '#statePrimary', 'Barisal')
      expect(select.text()).toEqual('Barisal')
    })
    it('changes the district select', async () => {
      selectOption(component, '#statePrimary', 'Barisal')
      const select = selectOption(component, '#districtPrimary', 'BARGUNA')
      expect(select.text()).toEqual('BARGUNA')
    })
    describe('when resetDependentSelectValues is called', () => {
      beforeEach(() => {
        const instance = component
          .find('FormSectionComponent')
          .instance() as any
        instance.resetDependentSelectValues('statePrimary')
      })
      it('resets dependent select fields', () => {
        expect(component.find('#districtPrimary').hostNodes().text()).toEqual(
          'Select'
        )
      })
      it('doesnt reset non dependent select fields', () => {
        expect(component.find('#countryPrimary').hostNodes().text()).toEqual(
          'Bangladesh'
        )
      })
    })
  })
})

describe('when field definition has location search input', () => {
  let component: ReactWrapper<{}, {}>
  const modifyDraft = vi.fn()

  beforeEach(async () => {
    const { store } = createStore()
    const { component: testComponent } = await createTestComponent(
      <FormFieldGenerator
        id="locationForm"
        setAllFieldsDirty={false}
        onChange={modifyDraft}
        draftData={{}}
        fields={[
          {
            name: 'placeOfBirth',
            type: LOCATION_SEARCH_INPUT,
            required: true,
            validator: [],
            label: formMessages.placeOfBirth,
            initialValue: '',
            searchableResource: ['facilities'],
            searchableType: ['HEALTH_FACILITY'],
            locationList: []
          }
        ]}
      />,
      { store }
    )

    component = testComponent
  })

  it('renders location search input without crashing', async () => {
    const input = await waitForElement(component, '#placeOfBirth')
    expect(input.length).toBeGreaterThan(0)
  })

  it('performs auto complete search among offline data', () => {
    const locationInput = component.find(`input#placeOfBirth`).hostNodes()

    locationInput.simulate('change', {
      target: { id: `input#placeOfBirth`, value: 'D' }
    })
    locationInput.simulate('focus')

    const autoCompleteSuggestion = component
      .find('#locationOption0d8474da-0361-4d32-979e-af91f020309e')
      .hostNodes()
    expect(autoCompleteSuggestion).toHaveLength(1)
  })

  it('clicking on autocomplete suggestion modifies draft', () => {
    const locationInput = component.find(`input#placeOfBirth`).hostNodes()

    locationInput.simulate('change', {
      target: { id: `input#placeOfBirth`, value: 'D' }
    })
    locationInput.simulate('focus')

    const autoCompleteSuggestion = component
      .find('#locationOption0d8474da-0361-4d32-979e-af91f020309e')
      .hostNodes()
    expect(autoCompleteSuggestion).toHaveLength(1)

    autoCompleteSuggestion.simulate('click')
    expect(modifyDraft).toHaveBeenCalled()
  })
})

describe('when user is in the register section', () => {
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store } = createStore()
    const draft = createDeclaration(EventType.Birth)
    store.dispatch(storeDeclaration(draft))
    const modifyDraft = vi.fn()
    const { component: testComponent } = await createTestComponent(
      <FormFieldGenerator
        id="registration"
        onChange={modifyDraft}
        setAllFieldsDirty={false}
        draftData={draft.data}
        fields={[
          {
            name: 'registrationPhone',
            type: TEL,
            label: {
              defaultMessage: 'Phone number',
              id: 'form.field.label.declaration.phone',
              description: 'Input label for phone input'
            },
            required: true,
            initialValue: '',
            validator: []
          }
        ]}
      />,
      {
        store
      }
    )

    component = testComponent
  })
  it('renders registration phone type as tel', () => {
    expect(
      component.find('#registrationPhone').hostNodes().prop('type')
    ).toEqual('tel')
  })
})

describe('when field definition has nested fields', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()
    const draft = createDeclaration(EventType.Birth)
    store.dispatch(storeDeclaration(draft))
    const modifyDraft = vi.fn()
    const { component: testComponent } = await createTestComponent(
      <FormFieldGenerator
        id="registration"
        onChange={modifyDraft}
        setAllFieldsDirty={false}
        draftData={draft.data}
        fields={[
          {
            name: 'informant',
            type: RADIO_GROUP_WITH_NESTED_FIELDS,
            label: {
              defaultMessage: 'Informant',
              description: 'Form section name for Informant',
              id: 'form.section.informant.name'
            },
            required: true,
            initialValue: '',
            validator: [],
            options: [
              {
                value: 'FATHER',
                label: {
                  defaultMessage: 'Father',
                  description: 'Label for option Father',
                  id: 'form.field.label.informantRelation.father'
                }
              },
              {
                value: 'MOTHER',
                label: {
                  defaultMessage: 'Mother',
                  description: 'Label for option Mother',
                  id: 'form.field.label.informantRelation.mother'
                }
              }
            ],
            nestedFields: {
              FATHER: [
                {
                  name: 'informantPhoneFather',
                  type: TEL,
                  label: {
                    defaultMessage: 'Phone number',
                    description: 'Input label for phone input',
                    id: 'form.field.label.phoneNumber'
                  },
                  required: false,
                  initialValue: '',
                  validator: [phoneNumberFormat]
                }
              ],
              MOTHER: [
                {
                  name: 'informantPhoneMother',
                  type: TEL,
                  label: {
                    defaultMessage: 'Phone number',
                    description: 'Input label for phone input',
                    id: 'form.field.label.phoneNumber'
                  },
                  required: false,
                  initialValue: '',
                  validator: [phoneNumberFormat]
                }
              ]
            }
          }
        ]}
      />,
      {
        store
      }
    )

    component = testComponent
  })

  it('renders radio group with nested fields', () => {
    expect(component.find('#informant').length).toBeGreaterThanOrEqual(1)
  })

  it('when clicking on a radio option renders nested fields', () => {
    component
      .find('#informant_MOTHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })
    component.update()

    expect(
      component.find(
        'input[name="informant.nestedFields.informantPhoneMother"]'
      )
    ).toHaveLength(1)
  })

  it('changing radio button resets nested field values', () => {
    component
      .find('#informant_MOTHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })

    component
      .find('input[name="informant.nestedFields.informantPhoneMother"]')
      .simulate('change', {
        target: {
          name: 'informant.nestedFields.informantPhoneMother',
          value: '01912345678'
        }
      })

    expect(
      component
        .find('input[name="informant.nestedFields.informantPhoneMother"]')
        .props().value
    ).toEqual('01912345678')

    component
      .find('#informant_FATHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })

    component
      .find('#informant_MOTHER')
      .hostNodes()
      .simulate('change', { target: { checked: true } })

    expect(
      component
        .find('input[name="informant.nestedFields.informantPhoneMother"]')
        .props().value
    ).toEqual('')
  })
})

describe('when field definition has date field', () => {
  let component: ReactWrapper<{}, {}>
  const modifyDraft = vi.fn()
  const FUTURE_DATE = new Date(2020, 11, 7)

  async function updateDateField(
    wrapper: ReactWrapper,
    id: string,
    dateValue: Date
  ) {
    const dayInput = wrapper.find(`input#${id}-dd`).hostNodes()
    const monthInput = wrapper.find(`input#${id}-mm`).hostNodes()
    const yearInput = wrapper.find(`input#${id}-yyyy`).hostNodes()

    dayInput.simulate('focus')
    dayInput.simulate('change', {
      target: { id: `${id}-dd`, value: dateValue.getDay().toString() }
    })
    dayInput.simulate('blur')

    monthInput.simulate('focus')
    monthInput.simulate('change', {
      target: { id: `${id}-mm`, value: (dateValue.getMonth() + 1).toString() }
    })
    monthInput.simulate('blur')

    yearInput.simulate('focus')
    yearInput.simulate('change', {
      target: { id: `${id}-yyyy`, value: dateValue.getFullYear().toString() }
    })
    yearInput.simulate('blur')

    await flushPromises()
    component.update()
  }

  beforeAll(() => {
    Date.now = vi.fn(() => 1603367390211)
  })

  describe('in case of static date field', () => {
    beforeEach(async () => {
      const { store } = createStore()
      const { component: testComponent } = await createTestComponent(
        <FormFieldGenerator
          id="locationForm"
          setAllFieldsDirty={false}
          onChange={modifyDraft}
          draftData={{}}
          fields={[
            {
              name: 'childDateOfBirth',
              type: DATE,
              required: true,
              validator: [dateNotInFuture()],
              label: formMessages.dateOfBirth,
              initialValue: ''
            }
          ]}
        />,
        { store }
      )

      component = testComponent
    })

    it('shows validation errors for invalid date', async () => {
      await updateDateField(component, 'childDateOfBirth', FUTURE_DATE)

      expect(
        component.find('#childDateOfBirth_error').hostNodes().length
      ).toBeGreaterThan(0)
    })
  })
})

describe('when field definition has number field', () => {
  let component: ReactWrapper<{}, {}>
  const modifyDraftMock = vi.fn()

  beforeEach(async () => {
    const { store } = createStore()
    const { component: testComponent } = await createTestComponent(
      <FormFieldGenerator
        id="numberForm"
        setAllFieldsDirty={false}
        onChange={modifyDraftMock}
        draftData={{}}
        fields={[
          {
            name: 'multipleBirth',
            type: NUMBER,
            required: true,
            validator: [],
            label: formMessages.multipleBirth,
            initialValue: ''
          }
        ]}
      />,
      {
        store
      }
    )

    component = testComponent
  })

  it('field does not take input of non numeric characters', async () => {
    const eventPreventDefaultMock = vi.fn()
    const numberInputElement = await waitForElement(
      component,
      'input#multipleBirth'
    )
    numberInputElement.hostNodes().simulate('keypress', {
      key: 'e',
      preventDefault: eventPreventDefaultMock
    })

    expect(eventPreventDefaultMock).toBeCalledTimes(1)
  })
})

describe('when field definition has select field on mobile device', () => {
  let component: ReactWrapper<{}, {}>
  const modifyDraftMock = vi.fn()
  const scrollMock = vi.fn()

  beforeAll(async () => {
    resizeWindow(412, 755)
  })

  beforeEach(async () => {
    window.HTMLElement.prototype.scrollIntoView = scrollMock
    const { store } = createStore()
    const { component: testComponent } = await createTestComponent(
      <FormFieldGenerator
        id="numberForm"
        setAllFieldsDirty={false}
        onChange={modifyDraftMock}
        draftData={{}}
        fields={[
          {
            name: 'countryPrimary',
            type: SELECT_WITH_OPTIONS,
            label: formMessages.country,
            required: true,
            initialValue: window.config.COUNTRY.toUpperCase(),
            validator: [],
            options: countries
          }
        ]}
      />,
      {
        store
      },
      { attachTo: document.body }
    )

    component = testComponent
  })

  it('triggers scroll up when focus so that soft keyboard does not block options', async () => {
    const input = component.find('#countryPrimary').hostNodes()

    input.find('input').simulate('focus').update()

    input.find('.react-select__control').simulate('mousedown').update()
    await flushPromises()
    component.update()
    expect(scrollMock).toBeCalled()
  })
})
