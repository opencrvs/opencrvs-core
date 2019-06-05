import * as React from 'react'
import {
  createTestComponent,
  selectOption,
  mockOfflineData
} from '@register/tests/util'
import { FormFieldGenerator } from '@register/components/form/FormFieldGenerator'
import { ReactWrapper } from 'enzyme'
import { createApplication, storeApplication } from '@register/applications'
import { createStore } from '@register/store'
import {
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  TEL,
  Event
} from '@register/forms'
import { countries } from '@register/forms/countries'
import { OFFLINE_LOCATIONS_KEY } from '@register/offline/reducer'

import { messages as addressMessages } from '@register/forms/address'

export interface IMotherSectionFormData {
  firstName: string
}

const offlineResources = {
  locations: mockOfflineData.locations,
  facilities: mockOfflineData.facilities,
  healthFacilityFilterLocation: '',
  offlineDataLoaded: true,
  loadingError: false
}

describe('form component', () => {
  const { store } = createStore()
  const draft = createApplication(Event.BIRTH)
  store.dispatch(storeApplication(draft))
  const modifyDraft = jest.fn()
  let component: ReactWrapper<{}, {}>
  const testComponent = createTestComponent(
    <FormFieldGenerator
      id="mother"
      onChange={modifyDraft}
      setAllFieldsDirty={false}
      offlineResources={offlineResources}
      fields={[
        {
          name: 'countryPermanent',
          type: SELECT_WITH_OPTIONS,
          label: addressMessages.country,
          required: true,
          initialValue: window.config.COUNTRY.toUpperCase(),
          validate: [],
          options: countries
        },
        {
          name: 'statePermanent',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: addressMessages.state,
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
          label: addressMessages.district,
          required: true,
          initialValue: '',
          validate: [],
          dynamicOptions: {
            resource: OFFLINE_LOCATIONS_KEY,
            dependency: 'statePermanent'
          }
        },
        {
          name: 'phone',
          type: TEL,
          label: addressMessages.district,
          required: true,
          initialValue: '',
          validate: []
        }
      ]}
    />,
    store
  )
  component = testComponent.component
  describe('when user is in the moth​​er section', () => {
    it('renders the page', () => {
      expect(
        component.find('#countryPermanent_label').hostNodes()
      ).toHaveLength(1)
    })
    it('changes the state select', async () => {
      const select = selectOption(component, '#statePermanent', 'Barisal')
      expect(component.find(select).text()).toEqual('Barisal')
    })
    it('changes the district select', async () => {
      const select = selectOption(component, '#districtPermanent', 'BARGUNA')
      expect(component.find(select).text()).toEqual('BARGUNA')
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
        ).toEqual('Select...')
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

describe('form component registration section', () => {
  const { store } = createStore()
  const draft = createApplication(Event.BIRTH)
  store.dispatch(storeApplication(draft))
  const modifyDraft = jest.fn()
  let component: ReactWrapper<{}, {}>
  const testComponent = createTestComponent(
    <FormFieldGenerator
      id="registration"
      onChange={modifyDraft}
      setAllFieldsDirty={false}
      offlineResources={offlineResources}
      fields={[
        {
          name: 'registrationPhone',
          type: TEL,
          label: {
            defaultMessage: 'Phone number',
            id: 'formFields.registration.phone',
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
  describe('when user is in the register section', () => {
    it('renders registration phone type as tel', () => {
      expect(
        component
          .find('#registrationPhone')
          .hostNodes()
          .prop('type')
      ).toEqual('tel')
    })
  })
})
