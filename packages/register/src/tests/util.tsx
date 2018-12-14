import * as React from 'react'

import { Provider } from 'react-redux'
import { graphql, print } from 'graphql'
import ApolloClient from 'apollo-client'

import { MockedProvider } from 'react-apollo/test-utils'
import { ApolloLink, Observable } from 'apollo-link'
import { IStoreState, createStore, AppStore } from '../store'
import { InMemoryCache } from 'apollo-cache-inmemory'
import * as en from 'react-intl/locale-data/en'
import { mount, configure, shallow, ReactWrapper } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { addLocaleData, IntlProvider, intlShape } from 'react-intl'
import { App } from '../App'
import { getSchema } from './graphql-schema-mock'
import { ThemeProvider } from 'styled-components'
import { ENGLISH_STATE } from '../i18n/locales/en'
import { getTheme } from '@opencrvs/components/lib/theme'
import { config } from '../config'
import { I18nContainer } from '@opencrvs/register/src/i18n/components/I18nContainer'

configure({ adapter: new Adapter() })

function createGraphQLClient() {
  const schema = getSchema()

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(operation => {
      return new Observable(observer => {
        const { query, operationName, variables } = operation

        graphql(schema, print(query), null, null, variables, operationName)
          .then(result => {
            observer.next(result)
            observer.complete()
          })
          .catch(observer.error.bind(observer))
      })
    })
  })
}

addLocaleData([...en])

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}

export function createTestApp() {
  const { store, history } = createStore()
  const app = mount(
    <App store={store} history={history} client={createGraphQLClient()} />
  )

  return { history, app, store }
}

interface ITestView {
  intl: ReactIntl.InjectedIntl
}

const intlProvider = new IntlProvider(
  { locale: 'en', messages: ENGLISH_STATE.messages },
  {}
)
const { intl } = intlProvider.getChildContext()

function nodeWithIntlProp(node: React.ReactElement<ITestView>) {
  return React.cloneElement(node, { intl })
}

export function createTestComponent(
  node: React.ReactElement<ITestView>,
  store: AppStore,
  graphqlMocks: any = null
) {
  const component = mount(
    <MockedProvider mocks={graphqlMocks} addTypename={false}>
      <Provider store={store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme(config.COUNTRY)}>
            {nodeWithIntlProp(node)}
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    </MockedProvider>,
    {
      context: { intl },
      childContextTypes: { intl: intlShape }
    }
  )

  return { component, store }
}

export function createShallowRenderedComponent(
  node: React.ReactElement<ITestView>
) {
  return shallow(node)
}

export const wait = () => new Promise(res => process.nextTick(res))

export const selectOption = (
  wrapper: ReactWrapper<{}, {}, React.Component<{}, {}, any>>,
  selector: string,
  option: string
): string => {
  const input = wrapper
    .find(`${selector} input`)
    .instance() as React.InputHTMLAttributes<HTMLInputElement>
  input.value = option.charAt(0)
  wrapper.find(`${selector} input`).simulate('change', {
    target: { value: option.charAt(0) }
  })
  wrapper
    .find(`${selector} .react-select__menu div[children="${option}"]`)
    .simulate('click')
  return `${selector} .react-select__single-value`
}

export const mockUserResponse = {
  data: {
    getUser: {
      catchmentArea: [
        {
          id: 'ddab090d-040e-4bef-9475-314a448a576a',
          name: 'Dhaka',
          status: 'active',
          __typename: 'Location'
        },
        {
          id: 'f9ec1fdb-086c-4b3d-ba9f-5257f3638286',
          name: 'GAZIPUR',
          status: 'active',
          __typename: 'Location'
        },
        {
          id: '825b17fb-4308-48cb-b77c-2f2cee4f14b9',
          name: 'KALIGANJ',
          status: 'active',
          __typename: 'Location'
        },
        {
          id: '123456789',
          name: 'BAKTARPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION',
              __typename: 'Identifier'
            }
          ],
          __typename: 'Location'
        }
      ],
      primaryOffice: {
        id: '2a83cf14-b959-47f4-8097-f75a75d1867f',
        name: 'Kaliganj Union Sub Center',
        status: 'active',
        __typename: 'Location'
      },
      __typename: 'User'
    }
  }
}

export const mockApplicationData = {
  child: {
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Mike',
    familyNameEng: 'Test',
    childBirthDate: '1977-09-20',
    gender: 'male',
    weightAtBirth: '3.5',
    attendantAtBirth: 'MIDWIFE',
    typeOfBirth: 'SINGLE'
  },
  mother: {
    firstNames: 'স্পিভক',
    familyName: 'গায়ত্রী',
    firstNamesEng: 'Liz',
    familyNameEng: 'Test',
    iD: '654651',
    iDType: 'NATIONAL_ID',
    motherBirthDate: '1949-05-31',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    countryPermanent: 'BGD',
    statePermanent: 'state2',
    districtPermanent: 'district2',
    addressLine1Permanent: '',
    addressLine2Permanent: '',
    addressLine3Options1Permanent: '',
    addressLine4Permanent: 'upazila1',
    postalCodePermanent: '',
    country: 'BGD',
    state: 'state2',
    district: 'district2',
    addressLine1: '',
    addressLine2: '',
    addressLine3Options1: '',
    addressLine4: 'upazila2',
    postalCode: ''
  },
  father: {
    fathersDetailsExist: true,
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Jeff',
    familyNameEng: 'Test',
    iD: '43468',
    iDType: 'NATIONAL_ID',
    fatherBirthDate: '1950-05-19',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    countryPermanent: 'BGD',
    statePermanent: 'state2',
    districtPermanent: 'district2',
    addressLine1Permanent: '',
    addressLine2Permanent: '',
    addressLine3Options1Permanent: '',
    addressLine4Permanent: 'upazila1',
    postalCodePermanent: '',
    country: 'BGD',
    state: 'state2',
    district: 'district2',
    addressLine1: '',
    addressLine2: '',
    addressLine3Options1: '',
    addressLine4: 'upazila2',
    postalCode: '',
    permanentAddressSameAsMother: true,
    addressSameAsMother: true
  },
  registration: {
    whoseContactDetails: 'MOTHER',
    presentAtBirthRegistration: 'BOTH_PARENTS',
    registrationPhone: '01557394986',
    registrationEmail: 'test@tester.com'
  }
}
