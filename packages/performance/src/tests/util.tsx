import * as React from 'react'
import { Provider } from 'react-redux'
import {
  IStoreState,
  createStore,
  AppStore
} from '@opencrvs/performance/src/store'
import { mount, configure, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import { ENGLISH_STATE } from '@opencrvs/performance/src/i18n/locales/en'
import { IntlProvider, intlShape } from 'react-intl'
import { I18nContainer } from '@opencrvs/performance/src/i18n/components/I18nContainer'
import { config } from '../config'

configure({ adapter: new Adapter() })

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
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

export function createShallowRenderedComponent(
  node: React.ReactElement<ITestView>
) {
  return shallow(node)
}

export function createTestComponent(
  node: React.ReactElement<ITestView>,
  store: AppStore
) {
  const component = mount(
    <Provider store={store}>
      <I18nContainer>
        <ThemeProvider theme={getTheme(config.COUNTRY)}>
          {nodeWithIntlProp(node)}
        </ThemeProvider>
      </I18nContainer>
    </Provider>,
    {
      context: { intl },
      childContextTypes: { intl: intlShape }
    }
  )

  return { component, store }
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

export const userDetails = {
  name: [
    {
      use: 'en',
      firstNames: 'Shakib',
      familyName: 'Al Hasan',
      __typename: 'HumanName'
    },
    { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
  ],
  role: 'DISTRICT_REGISTRAR',
  primaryOffice: {
    id: '6327dbd9-e118-4dbe-9246-cb0f7649a666',
    name: 'Kaliganj Union Sub Center',
    status: 'active'
  },
  catchmentArea: [
    {
      id: '850f50f3-2ed4-4ae6-b427-2d894d4a3329',
      name: 'Dhaka',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '3'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '30' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DIVISION'
        }
      ]
    },
    {
      id: '812ed387-f8d5-4d55-ad05-936292385990',
      name: 'GAZIPUR',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '20'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '33' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DISTRICT'
        }
      ]
    },
    {
      id: '90d39759-7f02-4646-aca3-9272b4b5ce5a',
      name: 'KALIGANJ',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '165'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UPAZILA'
        }
      ]
    },
    {
      id: '43c17986-62cf-4551-877c-be095fb6e5d0',
      name: 'BAKTARPUR',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '3473'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '17' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UNION'
        }
      ]
    }
  ]
}
