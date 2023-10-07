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
import { App } from '@client/App'
import { Event, SystemRoleType, Status } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { offlineDataReady, setOfflineData } from '@client/offline/actions'
import { AppStore, createStore, IStoreState } from '@client/store'
import { ThemeProvider } from 'styled-components'
import { getSchema } from '@client/tests/graphql-schema-mock'
import { I18nContainer } from '@opencrvs/client/src/i18n/components/I18nContainer'
import { getTheme } from '@opencrvs/components/lib/theme'
import { join } from 'path'
import {
  configure,
  mount,
  ReactWrapper,
  shallow,
  MountRendererProps
} from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { readFileSync } from 'fs'
import { graphql, print } from 'graphql'
import * as jwt from 'jsonwebtoken'
import * as React from 'react'
import {
  ApolloProvider,
  NetworkStatus,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable
} from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { IntlShape } from 'react-intl'
import { Provider } from 'react-redux'
import { AnyAction, Store } from 'redux'
import { waitForElement } from './wait-for-element'
import { setUserDetails } from '@client/profile/profileActions'
import { createLocation, createMemoryHistory, History } from 'history'
import { stringify } from 'query-string'
import { match as Match } from 'react-router'
import { ConnectedRouter } from 'connected-react-router'
import { mockOfflineData } from './mock-offline-data'
import { Section, SubmissionAction } from '@client/forms'
import { SUBMISSION_STATUS } from '@client/declarations'
import { vi } from 'vitest'
import { getSystemRolesQuery } from '@client/forms/user/query/queries'
import { createOrUpdateUserMutation } from '@client/forms/user/mutation/mutations'
import { draftToGqlTransformer } from '@client/transformer'
import { deserializeFormSection } from '@client/forms/deserializer/deserializer'
import * as builtInValidators from '@client/utils/validate'

export const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
export const registrationClerkScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ2YWxpZGF0ZSIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU3ODMwNzgzOSwiZXhwIjoxNTc4OTEyNjM5LCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6cmVzb3VyY2VzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNWRmYmE5NDYxMTEyNTliZDBjMzhhY2JhIn0.CFUy-L414-8MLf6pjA8EapK6qN1yYN6Y0ywcg1GtWhRxSWnT0Kw9d2OOK_IVFBAqTXLROQcwHYnXC2r6Ka53MB14HUZ39H7HrOTFURCYknYGIeGmyFpBjoXUj4yc95_f1FCpW6fQReBMnSIzUwlUGcxK-ttitSLfQebPFaVosM6kQpKd-n5g6cg6eS9hsYzxVme9kKkrxy5HRkxjNe8VfXEheKGqpRHxLGP7bo1bIhw8BWto9kT2kxm0NLkWzbqhxKyVrk8cEdcFiIAbUt6Fzjcx_uVPvLnJPNQAkZEO3AdqbZDFuvmBQWCf2Z6l9c8fYuWRD4SA5tBCcIKzUcalEg'
export const validToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'
export const validImageB64String =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
export const inValidImageB64String =
  'wee7dfaKGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
export const natlSysAdminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJzeXNhZG1pbiIsIm5hdGxzeXNhZG1pbiIsImRlbW8iXSwiaWF0IjoxNjQ5NjU3MTM4LCJleHAiOjE2NTAyNjE5MzgsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjIyZjgxYjQyY2Q1MzdiZjkxZGFhMTBiIn0.MojnxjSVja4VkS5ufVtpJHmiqQqngW3Zb6rHv4MqKwqSgHptjta1A-1xdpkfadxr0pVIYTh-rhKP93LPCTfThkA01oW8qgkUr0t_02cgJ5KLe1B3R5QFJ9i1IzLye9yOeakfpbtnk67cwJ2r4KTJMxj5BWucdPGK8ifZRBdDrt9HsTtcDOutgLmEp2VnxLvc2eAEmoBBp6mRZ8lOYIRei5UHfaROCk0vdwjLchiqQWH9GE8hxU3RIA1jpzshd3_TC4G0rvuIXnBGf9VQaH-gkNW7a44xLVHhdENxAsGTdyeSHRC83wbeoUZkuOFQpF8Iz-8SbLEQfmipdzeBAsBgWg'

export const ACTION_STATUS_MAP = {
  [SubmissionAction.SUBMIT_FOR_REVIEW]: SUBMISSION_STATUS.READY_TO_SUBMIT,
  [SubmissionAction.APPROVE_DECLARATION]: SUBMISSION_STATUS.READY_TO_APPROVE,
  [SubmissionAction.REGISTER_DECLARATION]: SUBMISSION_STATUS.READY_TO_REGISTER,
  [SubmissionAction.REJECT_DECLARATION]: SUBMISSION_STATUS.READY_TO_REJECT,
  [SubmissionAction.MAKE_CORRECTION]:
    SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
  [SubmissionAction.REQUEST_CORRECTION]:
    SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
  [SubmissionAction.ISSUE_DECLARATION]: SUBMISSION_STATUS.READY_TO_ISSUE,
  [SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION]:
    SUBMISSION_STATUS.READY_TO_CERTIFY,
  [SubmissionAction.CERTIFY_DECLARATION]: SUBMISSION_STATUS.READY_TO_CERTIFY,
  [SubmissionAction.ARCHIVE_DECLARATION]: SUBMISSION_STATUS.READY_TO_ARCHIVE,
  [SubmissionAction.APPROVE_CORRECTION]:
    SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION,
  [SubmissionAction.REJECT_CORRECTION]:
    SUBMISSION_STATUS.READY_TO_REQUEST_CORRECTION
} as const

export const validateScopeToken = jwt.sign(
  { scope: ['validate'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  }
)

export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

export const getItem = vi.fn()
export const setItem = vi.fn()

configure({ adapter: new Adapter() })

function createGraphQLClient() {
  const schema = getSchema()
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink((operation) => {
      return new Observable((observer) => {
        const { query, operationName, variables } = operation

        graphql(schema, print(query), null, null, variables, operationName)
          .then((result) => {
            observer.next(result)
            observer.complete()
          })
          .catch(observer.error.bind(observer))
      })
    })
  })
}

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}

export function waitForReady(app: ReactWrapper) {
  return waitForElement(app, '#readyDeclaration')
}

export async function createTestApp(
  config = { waitUntilOfflineCountryConfigLoaded: true }
) {
  const { store, history } = await createTestStore()
  const app = mount(
    <App store={store} history={history} client={createGraphQLClient()} />
  )

  if (config.waitUntilOfflineCountryConfigLoaded) {
    await waitForReady(app)
  }
  return { history, app, store }
}

interface ITestView {
  intl: IntlShape
}

export function createShallowRenderedComponent(
  node: React.ReactElement<ITestView>
) {
  return shallow(node)
}

export const resizeWindow = (width: number, height: number) => {
  const resizeEvent = document.createEvent('Event')
  resizeEvent.initEvent('resize', true, true)
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  })
  window.dispatchEvent(resizeEvent)
}

export const selectOption = (
  wrapper: ReactWrapper<{}, {}, React.Component<{}, {}, any>>,
  selector: string,
  option: string
): ReactWrapper => {
  const input = wrapper.find(selector).hostNodes()

  input.find('input').simulate('focus').update()
  input.find('.react-select__control').simulate('mousedown').update()

  const availableOptions: string[] = []

  const nodes = input
    .update()
    .find('.react-select__option')
    .findWhere((el: ReactWrapper) => {
      const text = el.text()
      availableOptions.push(text)
      return text === option
    })
    .hostNodes()

  if (nodes.length === 0) {
    throw new Error(
      `Couldn't find an option "${option}" from select.\nAvailable options are:\n${availableOptions.join(
        ',\n'
      )}`
    )
  }

  nodes.simulate('click').update()

  return input.find('.react-select__control')
}

const currentUserId = '123'

export const eventAddressData = {
  country: 'FAR',
  state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  district: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrban: 'URBAN',
  cityUrbanOption: 'my town',
  addressLine3UrbanOption: 'my res area',
  addressLine2UrbanOption: 'my street',
  numberUrbanOption: 12,
  postalCode: 'my postcode',
  addressLine5: '',
  internationalState: '',
  internationalDistrict: '',
  internationalCity: '',
  internationalAddressLine1: '',
  internationalAddressLine2: '',
  internationalAddressLine3: '',
  internationalPostalCode: ''
}

export const primaryAddressData = {
  primaryAddress: '',
  countryPrimary: 'FAR',
  statePrimary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtPrimary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanPrimary: 'RURAL',
  cityUrbanOptionPrimary: '',
  addressLine3UrbanOptionPrimary: '',
  addressLine2UrbanOptionPrimary: '',
  numberUrbanOptionPrimary: '',
  postalCodePrimary: '',
  addressLine5Primary: 'my village'
}

export const secondaryAddressData = {
  secondaryAddress: '',
  countrySecondary: 'FAR',
  stateSecondary: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
  districtSecondary: '852b103f-2fe0-4871-a323-51e51c6d9198',
  ruralOrUrbanSecondary: 'URBAN',
  cityUrbanOptionSecondary: 'my secondary town',
  addressLine3UrbanOptionSecondary: 'my secondary res area',
  addressLine2UrbanOptionSecondary: 'my secondary street',
  numberUrbanOptionSecondary: 12,
  postalCodeSecondary: 'my secondary postcode',
  addressLine5Secondary: ''
}

export const primaryInternationalAddressLines = {
  internationalStatePrimary: 'ujggiu',
  internationalDistrictPrimary: 'iuoug',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostalCodePrimary: ''
}

export const secondaryInternationalAddressLines = {
  internationalStateSecondary: 'ugou',
  internationalDistrictSecondary: 'iugoug',
  internationalCitySecondary: '',
  internationalAddressLine1Secondary: '',
  internationalAddressLine2Secondary: '',
  internationalAddressLine3Secondary: '',
  internationalPostalCodeSecondary: ''
}

export const userDetails: UserDetails = {
  userMgntUserID: '123',
  id: 'b77b78af-a259-4bc1-85d5-b1e8c1382273',
  status: 'active' as Status,
  creationDate: '1487076708000',
  practitionerId: '12345',
  name: [
    {
      use: 'en',
      firstNames: 'Shakib',
      familyName: 'Al Hasan'
    },
    { use: 'bn', firstNames: '', familyName: '' }
  ],
  systemRole: SystemRoleType.FieldAgent,
  role: {
    _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
    labels: [
      {
        lang: 'en',
        label: 'ENTREPENEUR'
      }
    ]
  },
  mobile: '01677701431',
  primaryOffice: {
    id: '6327dbd9-e118-4dbe-9246-cb0f7649a666',
    name: 'Kaliganj Union Sub Center',
    alias: ['কালিগাঞ্জ ইউনিয়ন পরিষদ'],
    status: 'active'
  },
  catchmentArea: [
    {
      id: '850f50f3-2ed4-4ae6-b427-2d894d4a3329',
      name: 'Dhaka',
      alias: ['ঢাকা'],
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/geo-id',
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
      alias: ['গাজীপুর'],
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/geo-id',
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
      alias: ['কালিগাঞ্জ'],
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/geo-id',
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
      alias: ['বক্তারপুর'],
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/geo-id',
          value: '3473'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '17' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UNION'
        }
      ]
    }
  ],
  localRegistrar: {
    role: 'LOCAL_REGISTRAR' as SystemRoleType,
    signature: {
      data: `data:image/png;base64,${validImageB64String}`,
      type: 'image/png'
    },
    name: [
      {
        use: 'en',
        firstNames: 'Mohammad',
        familyName: 'Ashraful',
        __typename: 'HumanName'
      }
    ]
  }
}

export const mockUserResponseWithName = {
  data: {
    getUser: userDetails
  }
}

export const mockUserResponse = {
  data: {
    getUser: {
      userMgntUserID: '123',
      catchmentArea: [
        {
          id: 'ddab090d-040e-4bef-9475-314a448a576a',
          name: 'Dhaka',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '3'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '30' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DIVISION'
            }
          ],
          __typename: 'Location'
        },
        {
          id: 'f9ec1fdb-086c-4b3d-ba9f-5257f3638286',
          name: 'GAZIPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '20'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '33' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DISTRICT'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '825b17fb-4308-48cb-b77c-2f2cee4f14b9',
          name: 'KALIGANJ',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UPAZILA'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '123456789',
          name: 'BAKTARPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '3473'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '17' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
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
      __typename: 'User',
      signature: {
        data: `data:image/png;base64,${validImageB64String}`,
        type: 'image/png'
      },
      localRegistrar: {
        role: 'LOCAL_REGISTRAR',
        signature: {
          data: `data:image/png;base64,${validImageB64String}`,
          type: 'image/png'
        },
        name: [
          {
            use: 'en',
            firstNames: 'Mohammad',
            familyName: 'Ashraful',
            __typename: 'HumanName'
          }
        ]
      },
      systemRole: 'LOCAL_REGISTRAR'
    }
  }
}

export const mockLocalSysAdminUserResponse = {
  data: {
    getUser: {
      userMgntUserID: '123',
      catchmentArea: [
        {
          id: 'ddab090d-040e-4bef-9475-314a448a576a',
          name: 'Dhaka',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '3'
            }
          ],
          __typename: 'Location'
        },
        {
          id: 'f9ec1fdb-086c-4b3d-ba9f-5257f3638286',
          name: 'GAZIPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '20'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '825b17fb-4308-48cb-b77c-2f2cee4f14b9',
          name: 'KALIGANJ',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '165'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '123456789',
          name: 'BAKTARPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '3473'
            }
          ],
          __typename: 'Location'
        }
      ],
      primaryOffice: {
        id: '0d8474da-0361-4d32-979e-af91f012340a',
        name: 'Kaliganj Union Sub Center',
        status: 'active',
        __typename: 'Location'
      },
      systemRole: 'LOCAL_SYSTEM_ADMIN',
      signature: {
        data: `data:image/png;base64,${validImageB64String}`,
        type: 'image/png'
      },
      localRegistrar: {
        role: 'LOCAL_SYSTEM_ADMIN',
        signature: {
          data: `data:image/png;base64,${validImageB64String}`,
          type: 'image/png'
        },
        name: [
          {
            use: 'en',
            given: ['Mohammad'],
            family: 'Ashraful'
          }
        ]
      },
      __typename: 'User'
    }
  }
}

export const mockRegistrarUserResponse = {
  data: {
    getUser: {
      userMgntUserID: '123',
      catchmentArea: [
        {
          id: 'ddab090d-040e-4bef-9475-314a448a576a',
          name: 'Dhaka',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '3'
            }
          ],
          __typename: 'Location'
        },
        {
          id: 'f9ec1fdb-086c-4b3d-ba9f-5257f3638286',
          name: 'GAZIPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '20'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '825b17fb-4308-48cb-b77c-2f2cee4f14b9',
          name: 'KALIGANJ',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '165'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '123456789',
          name: 'BAKTARPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/geo-id',
              value: '3473'
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
      systemRole: 'LOCAL_REGISTRAR',
      signature: {
        data: `data:image/png;base64,${validImageB64String}`,
        type: 'image/png'
      },
      localRegistrar: {
        role: 'LOCAL_REGISTRAR',
        signature: {
          data: `data:image/png;base64,${validImageB64String}`,
          type: 'image/png'
        },
        name: [
          {
            use: 'en',
            given: ['Mohammad'],
            family: 'Ashraful'
          }
        ]
      },
      __typename: 'User'
    }
  }
}

export function appendStringToKeys(
  obj: Record<string, any>,
  appendString: string
): Record<string, any> {
  const newObj: Record<string, any> = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key + appendString] = obj[key]
    }
  }

  return newObj
}

export const mockDeclarationData = {
  child: {
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Mike',
    familyNameEng: 'Test',
    childBirthDate: '1977-09-20',
    gender: 'male',
    weightAtBirth: '3.5',
    attendantAtBirth: 'MIDWIFE',
    birthType: 'SINGLE',
    multipleBirth: 1,
    placeOfBirth: 'HEALTH_FACILITY',
    birthLocation: '627fc0cc-e0e2-4c09-804d-38a9fa1807ee'
  },
  mother: {
    detailsExist: true,
    firstNames: 'স্পিভক',
    familyName: 'গায়ত্রী',
    firstNamesEng: 'Liz',
    familyNameEng: 'Test',
    iD: '6546511876932',
    iDType: 'NATIONAL_ID',
    motherBirthDate: '1949-05-31',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    exactDateOfBirthUnknown: false,
    ...appendStringToKeys(primaryAddressData, 'Mother'),
    ...appendStringToKeys(primaryInternationalAddressLines, 'Mother'),
    ...appendStringToKeys(secondaryAddressData, 'Mother'),
    ...appendStringToKeys(secondaryInternationalAddressLines, 'Mother')
  },
  father: {
    detailsExist: true,
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Jeff',
    familyNameEng: 'Test',
    iD: '123456789',
    iDType: 'PASSPORT',
    fatherBirthDate: '1950-05-19',
    exactDateOfBirthUnknown: false,
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    ...appendStringToKeys(primaryAddressData, 'Father'),
    ...appendStringToKeys(primaryInternationalAddressLines, 'Father'),
    ...appendStringToKeys(secondaryAddressData, 'Father'),
    ...appendStringToKeys(secondaryInternationalAddressLines, 'Father'),
    primaryAddressSameAsOtherPrimary: true
  },
  informant: {
    informantType: 'MOTHER',
    otherInformantType: '',
    registrationPhone: '01733333333',
    registrationEmail: 'sdfsbg@hgh.com',
    firstNames: 'স্পিভক',
    familyName: 'গায়ত্রী',
    firstNamesEng: 'Liz',
    familyNameEng: 'Test',
    iD: '6546511876932',
    iDType: 'NATIONAL_ID',
    motherBirthDate: '1949-05-31',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    exactDateOfBirthUnknown: false,
    ...appendStringToKeys(primaryAddressData, 'Mother'),
    ...appendStringToKeys(primaryInternationalAddressLines, 'Mother'),
    ...appendStringToKeys(secondaryAddressData, 'Mother'),
    ...appendStringToKeys(secondaryInternationalAddressLines, 'Mother')
  },
  registration: {
    informantsSignature: 'data:image/png;base64,abcd',

    registrationNumber: '201908122365BDSS0SE1',
    regStatus: {
      type: 'REGISTERED',
      officeName: 'MokhtarPur',
      officeAlias: 'মখতারপুর',
      officeAddressLevel3: 'Gazipur',
      officeAddressLevel4: 'Dhaka'
    },
    certificates: [{}]
  },
  documents: {}
}

export const mockDeathDeclarationData = {
  deceased: {
    iDType: 'NATIONAL_ID',
    iD: '1230000000000',
    firstNames: 'মকবুল',
    familyName: 'ইসলাম',
    firstNamesEng: 'Mokbul',
    familyNameEng: 'Islam',
    nationality: 'BGD',
    gender: 'male',
    maritalStatus: 'MARRIED',
    birthDate: '1987-02-16',
    exactDateOfBirthUnknown: false,
    ...appendStringToKeys(primaryAddressData, 'Deceased'),
    ...appendStringToKeys(primaryInternationalAddressLines, 'Deceased'),
    ...appendStringToKeys(secondaryAddressData, 'Deceased'),
    ...appendStringToKeys(secondaryInternationalAddressLines, 'Deceased')
  },
  informant: {
    informantType: 'SPOUSE',
    registrationPhone: '01733333333',
    registrationEmail: 'sesrthsthsr@sdfsgt.com',
    informantIdType: 'NATIONAL_ID',
    iDType: 'NATIONAL_ID',
    informantID: '1230000000000',
    informantFirstNames: '',
    informantFamilyName: 'ইসলাম',
    informantFirstNamesEng: 'Islam',
    informantFamilyNameEng: 'Islam',
    nationality: 'BGD',
    informantBirthDate: '',
    relationship: 'MOTHER',
    ...appendStringToKeys(primaryAddressData, 'Informant'),
    ...appendStringToKeys(primaryInternationalAddressLines, 'Informant'),
    ...appendStringToKeys(secondaryAddressData, 'Informant'),
    ...appendStringToKeys(secondaryInternationalAddressLines, 'Informant')
  },
  father: {
    fatherFirstNames: 'মোক্তার',
    fatherFamilyName: 'আলী',
    fatherFirstNamesEng: 'Moktar',
    fatherFamilyNameEng: 'Ali'
  },
  spouse: {
    hasDetails: {
      value: 'Yes',
      nestedFields: {
        spouseFirstNames: 'রেহানা',
        spouseFamilyName: 'আলী',
        spouseFirstNamesEng: 'Rehana',
        spouseFamilyNameEng: 'Ali'
      }
    }
  },
  deathEvent: {
    deathDate: '1987-02-16',
    manner: 'ACCIDENT',
    placeOfDeath: 'OTHER',
    deathLocation: '',
    ...appendStringToKeys(eventAddressData, 'Placeofdeath')
  },
  causeOfDeath: {
    causeOfDeathEstablished: false,
    methodOfCauseOfDeath: '',
    causeOfDeathCode: ''
  },
  documents: {
    imageUploader: [
      {
        data: 'base64-data',
        type: 'image/jpeg',
        optionValues: ["Proof of Deceased's ID", 'National ID (front)'],
        title: "Proof of Deceased's ID",
        description: 'National ID (front)'
      }
    ]
  },
  registration: {
    trackingId: 'DJDTKUQ',
    type: 'death',
    registrationNumber: '201908122365DDSS0SE1',
    commentsOrNotes: '',
    regStatus: {
      type: 'REGISTERED',
      officeName: 'MokhtarPur',
      officeAlias: 'মখতারপুর',
      officeAddressLevel3: 'Gazipur',
      officeAddressLevel4: 'Dhaka'
    },
    certificates: [
      {
        collector: {
          type: 'MOTHER'
        },
        hasShowedVerifiedDocument: true
      }
    ]
  }
}

export const mockMarriageDeclarationData = {
  registration: {
    trackingId: 'M2LA47X',
    registrationNumber: '2023M2LA47X',
    type: 'marriage',
    groomSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
    brideSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
    witnessOneSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
    witnessTwoSignature: 'data:image/png;base64,iVBORw0KGkSuQmCC',
    commentsOrNotes: '',
    regStatus: {
      type: 'REGISTERED',
      statusDate: '2023-03-09T09:22:12.673Z',
      officeName: 'Ibombo District Office',
      officeAlias: 'Ibombo District Office',
      officeAddressLevel3: '',
      officeAddressLevel4: ''
    },
    certificates: [
      {
        collector: {
          type: 'BRIDE'
        },
        hasShowedVerifiedDocument: true
      }
    ]
  },
  informant: {
    informantType: 'GROOM',
    otherInformantType: '',
    exactDateOfBirthUnknown: '',
    registrationPhone: '01733333333',
    registrationEmail: 'stheyhyj@segstg.com',
    _fhirID: '429445a4-f87c-467f-9d3c-f17f595a1143'
  },
  groom: {
    nationality: 'FAR',
    iD: '1296566563',
    groomBirthDate: '1998-12-12',
    exactDateOfBirthUnknown: false,
    firstNamesEng: 'Sadman',
    familyNameEng: 'Anik',
    marriedLastNameEng: 'Groom Last Name',
    ...appendStringToKeys(primaryAddressData, 'Groom'),
    ...appendStringToKeys(primaryInternationalAddressLines, 'Groom'),
    _fhirID: '89113c35-1310-4d8f-9352-0269a04a1c4a'
  },
  bride: {
    nationality: 'FAR',
    iD: '',
    brideBirthDate: '1998-12-12',
    exactDateOfBirthUnknown: false,
    firstNamesEng: 'Kaitlin',
    familyNameEng: 'Samo',
    marriedLastNameEng: 'Bride Last Name',
    ...appendStringToKeys(primaryAddressData, 'Bride'),
    ...appendStringToKeys(primaryInternationalAddressLines, 'Bride'),
    _fhirID: '09a68a88-921f-4eaf-8424-7d9d43e5804c'
  },
  marriageEvent: {
    marriageDate: '2020-12-12',
    typeOfMarriage: 'MONOGAMY',
    ...appendStringToKeys(eventAddressData, 'Placeofmarriage')
  },
  witnessOne: {
    firstNamesEng: 'Sadman',
    familyNameEng: 'Anik',
    relationship: 'headOfGroomFamily',
    _fhirID: '36972633-1c80-4fb4-a636-17f7dc9c2e14'
  },
  witnessTwo: {
    firstNamesEng: 'Edgar',
    familyNameEng: 'Samo',
    relationship: 'headOfGroomFamily',
    _fhirID: '1745b3d2-74fd-4b22-ba62-1c851d632f55'
  },
  documents: {
    imageUploader: [
      {
        data: 'base64-data',
        type: 'image/jpeg',
        optionValues: ["Proof of Deceased's ID", 'National ID (front)'],
        title: "Proof of Deceased's ID",
        description: 'National ID (front)'
      }
    ]
  }
}

export const mockBirthRegistrationSectionData = {
  informantsSignature: 'data:image/png;base64,abcd',
  registrationPhone: '01557394986',
  trackingId: 'BDSS0SE',
  registrationNumber: '201908122365BDSS0SE1',
  regStatus: {
    type: 'REGISTERED',
    officeName: 'MokhtarPur',
    officeAlias: 'মখতারপুর',
    officeAddressLevel3: 'Gazipur',
    officeAddressLevel4: 'Dhaka'
  },
  certificates: [
    {
      collector: {
        type: 'OTHER',
        relationship: 'Uncle',
        firstName: 'Mushraful',
        lastName: 'Hoque',
        iDType: 'PASSPORT',
        iD: '123456789',
        affidavitFile: {
          type: 'abc',
          data: 'BASE64 data'
        }
      },
      hasShowedVerifiedDocument: true
    }
  ]
}

export const mockDeathRegistrationSectionData = {
  trackingId: 'DDSS0SE',
  registrationNumber: '201908122365DDSS0SE1',
  type: 'death',
  commentsOrNotes: '',
  regStatus: {
    type: 'REGISTERED',
    officeName: 'MokhtarPur',
    officeAlias: 'মখতারপুর',
    officeAddressLevel3: 'Gazipur',
    officeAddressLevel4: 'Dhaka'
  },
  certificates: [
    {
      collector: {
        type: 'OTHER',
        relationship: 'Uncle',
        firstName: 'Mushraful',
        lastName: 'Hoque',
        iDType: 'PASSPORT',
        iD: '123456789'
      },
      hasShowedVerifiedDocument: true
    }
  ]
}

const mockFetchCertificatesTemplatesDefinition = [
  {
    id: '12313546',
    event: Event.Birth,
    status: 'ACTIVE',
    svgCode:
      '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="209.884" y="549.336">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="210" y="445.552">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Died on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of death&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="211" y="384.004">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfDeath}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Death Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
    svgDateCreated: '1640696680593',
    svgDateUpdated: '1644326332088',
    svgFilename: 'oCRVS_DefaultZambia_Death_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  },
  {
    id: '25313546',
    event: Event.Death,
    status: 'ACTIVE',
    svgCode:
      '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Was born on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of birth&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfBirth}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Birth Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
    svgDateCreated: '1640696804785',
    svgDateUpdated: '1643885502999',
    svgFilename: 'oCRVS_DefaultZambia_Birth_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  }
]

export const mockConfigResponse = {
  config: mockOfflineData.config,
  anonymousConfig: mockOfflineData.anonymousConfig,
  certificates: mockFetchCertificatesTemplatesDefinition,
  systems: mockOfflineData.systems
}

export const mockOfflineDataDispatch = {
  languages: mockOfflineData.languages,
  templates: mockOfflineData.templates,
  locations: mockOfflineData.locations,
  facilities: mockOfflineData.facilities,
  offices: mockOfflineData.offices,
  assets: mockOfflineData.assets,
  config: mockOfflineData.config,
  anonymousConfig: mockOfflineData.anonymousConfig,
  forms: JSON.parse(readFileSync(join(__dirname, './forms.json')).toString())
    .forms,
  systems: mockOfflineData.systems
}

export async function createTestStore() {
  const { store, history } = createStore()
  await store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  return { store, history }
}

export async function createTestComponent(
  node: React.ReactElement<ITestView>,
  {
    store,
    history,
    graphqlMocks,
    apolloClient
  }: {
    store: AppStore
    history: History
    graphqlMocks?: MockedProvider['props']['mocks']
    apolloClient?: ApolloClient<any>
  },
  options?: MountRendererProps
) {
  await store.dispatch(offlineDataReady(mockOfflineDataDispatch))

  const withGraphQL = (node: JSX.Element) => {
    if (apolloClient) {
      return <ApolloProvider client={apolloClient}>{node}</ApolloProvider>
    }

    return (
      <MockedProvider
        mocks={graphqlMocks}
        addTypename={false}
        defaultOptions={{
          watchQuery: { fetchPolicy: 'no-cache' },
          query: { fetchPolicy: 'no-cache' }
        }}
      >
        {node}
      </MockedProvider>
    )
  }

  function PropProxy(props: Record<string, any>) {
    return withGraphQL(
      <Provider store={store}>
        <ConnectedRouter noInitialPop={true} history={history}>
          <I18nContainer>
            <ThemeProvider theme={getTheme()}>
              <node.type {...node.props} {...props} />
            </ThemeProvider>
          </I18nContainer>
        </ConnectedRouter>
      </Provider>
    )
  }

  return mount(<PropProxy {...node.props} />, options)
}

export const getFileFromBase64String = (
  base64String: string,
  name: string,
  contentType: string
): File => {
  const byteCharacters = atob(base64String)
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / 1024)
  const byteArrays = new Array(slicesCount)

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * 1024
    const end = Math.min(begin + 1024, bytesLength)

    const bytes = new Array(end - begin)
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new File(byteArrays, name, {
    type: contentType
  })
}

export async function goToSection(component: ReactWrapper, nth: number) {
  for (let i = 0; i < nth; i++) {
    await waitForElement(component, '#next_section')
    component.find('#next_section').hostNodes().simulate('click')
    await flushPromises()
    await component.update()
  }
}

export async function goToEndOfForm(component: ReactWrapper) {
  await goToSection(component, 6)
  await waitForElement(component, '#review_header')
}

export async function goToDocumentsSection(component: ReactWrapper) {
  await goToSection(component, 4)
  await waitForElement(component, '#form_section_id_documents-view-group')
}

export async function goToFatherSection(component: ReactWrapper) {
  await goToSection(component, 3)
  await waitForElement(component, '#form_section_id_father-view-group')
}

export async function goToMotherSection(component: ReactWrapper) {
  await goToSection(component, 2)
  await waitForElement(component, '#form_section_id_mother-view-group')
}

export async function getRegisterFormFromStore(
  store: Store<IStoreState, AnyAction>,
  event: Event
) {
  await store.dispatch(setOfflineData(userDetails))
  const state = store.getState()
  return getRegisterForm(state)[event]
}

export async function getReviewFormFromStore(
  store: Store<IStoreState, AnyAction>,
  event: Event
) {
  await store.dispatch(setOfflineData(userDetails))
  const state = store.getState()
  return getReviewForm(state)![event]
}

export function setPageVisibility(isVisible: boolean) {
  // @ts-ignore
  document.hidden = !isVisible
  const evt = document.createEvent('HTMLEvents')
  evt.initEvent('visibilitychange', false, true)
  document.dispatchEvent(evt)
}

export function loginAsFieldAgent(store: AppStore) {
  return store.dispatch(
    setUserDetails({
      loading: false,
      networkStatus: NetworkStatus.ready,
      data: {
        getUser: {
          id: '5eba726866458970cf2e23c2',
          username: 'a.alhasan',
          creationDate: '2022-10-03T10:42:46.920Z',
          userMgntUserID: '5eba726866458970cf2e23c2',
          practitionerId: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
          mobile: '+8801711111111',
          systemRole: SystemRoleType.FieldAgent,
          role: {
            _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
            labels: [
              {
                lang: 'en',
                label: 'CHA'
              }
            ]
          },
          status: Status.Active,
          name: [
            {
              use: 'en',
              firstNames: 'Shakib',
              familyName: 'Al Hasan'
            }
          ],
          catchmentArea: [
            {
              id: '514cbc3a-cc99-4095-983f-535ea8cb6ac0',
              name: 'Baniajan',
              alias: ['বানিয়াজান'],
              status: 'active',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
                  value: 'division=9&district=30&upazila=233&union=4194'
                }
              ]
            }
          ],
          primaryOffice: {
            id: '0d8474da-0361-4d32-979e-af91f012340a',
            name: 'Kaliganj Union Sub Center',
            status: 'active',
            alias: ['বানিয়াজান']
          },
          localRegistrar: {
            name: [
              {
                use: 'en',
                firstNames: 'Mohammad',
                familyName: 'Ashraful'
              }
            ],
            role: SystemRoleType.LocalRegistrar,
            signature: undefined
          }
        }
      }
    })
  )
}

export function createRouterProps<
  T,
  Params extends { [K in keyof Params]?: string | undefined }
>(
  path: string,
  locationState?: T,
  {
    search,
    matchParams = {} as Params
  }: { search?: Record<string, string>; matchParams?: Params } = {}
) {
  const location = createLocation(path, locationState)

  /*
   * Uses memory history because goBack
   * wasn't working in the test environment
   */
  const history = createMemoryHistory<T>({
    initialEntries: [path]
  })
  history.location = location
  if (search) {
    location.search = stringify(search)
  }
  const match: Match<Params> = {
    isExact: false,
    path,
    url: path,
    params: matchParams
  }

  return { location, history, match }
}

export const mockRoles = {
  data: {
    getSystemRoles: [
      {
        id: '63c7ebee48dc29888b5b020d',
        value: 'FIELD_AGENT',
        roles: [
          {
            _id: '63ef9466f708ea080777c279',
            labels: [
              {
                lang: 'en',
                label: 'Health Worker',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Professionnel de Santé',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          },
          {
            _id: '63ef9466f708ea080777c27a',
            labels: [
              {
                lang: 'en',
                label: 'Police Worker',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Agent de Police',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          },
          {
            _id: '63ef9466f708ea080777c27b',
            labels: [
              {
                lang: 'en',
                label: 'Social Worker',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Travailleur Social',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          },
          {
            _id: '63ef9466f708ea080777c27c',
            labels: [
              {
                lang: 'en',
                label: 'Local Leader',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Leader Local',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          }
        ],
        __typename: 'SystemRole'
      },
      {
        id: '63c7ebee48dc29888b5b020e',
        value: 'REGISTRATION_AGENT',
        roles: [
          {
            _id: '63ef9466f708ea080777c27d',
            labels: [
              {
                lang: 'en',
                label: 'Registration Agent',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: "Agent d'enregistrement",
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          }
        ],
        __typename: 'SystemRole'
      },
      {
        id: '63c7ebee48dc29888b5b020f',
        value: 'LOCAL_REGISTRAR',
        roles: [
          {
            _id: '63ef9466f708ea080777c27e',
            labels: [
              {
                lang: 'en',
                label: 'Local Registrar',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Registraire local',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          }
        ],
        __typename: 'SystemRole'
      },
      {
        id: '63c7ebee48dc29888b5b0210',
        value: 'LOCAL_SYSTEM_ADMIN',
        roles: [
          {
            _id: '63ef9466f708ea080777c27f',
            labels: [
              {
                lang: 'en',
                label: 'Local System Admin',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Administrateur système local',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          }
        ],
        __typename: 'SystemRole'
      },
      {
        id: '63c7ebee48dc29888b5b0211',
        value: 'NATIONAL_SYSTEM_ADMIN',
        roles: [
          {
            _id: '63ef9466f708ea080777c280',
            labels: [
              {
                lang: 'en',
                label: 'National System Admin',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Administrateur système national',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          }
        ],
        __typename: 'SystemRole'
      },
      {
        id: '63c7ebee48dc29888b5b0212',
        value: 'PERFORMANCE_MANAGEMENT',
        roles: [
          {
            _id: '63ef9466f708ea080777c281',
            labels: [
              {
                lang: 'en',
                label: 'Performance Manager',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Gestion des performances',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          }
        ],
        __typename: 'SystemRole'
      },
      {
        id: '63c7ebee48dc29888b5b0213',
        value: 'NATIONAL_REGISTRAR',
        roles: [
          {
            _id: '63ef9466f708ea080777c282',
            labels: [
              {
                lang: 'en',
                label: 'National Registrar',
                __typename: 'RoleLabel'
              },
              {
                lang: 'fr',
                label: 'Registraire national',
                __typename: 'RoleLabel'
              }
            ],
            __typename: 'Role'
          }
        ],
        __typename: 'SystemRole'
      }
    ]
  }
}

export const mockFetchRoleGraphqlOperation = {
  request: {
    query: getSystemRolesQuery,
    variables: {}
  },
  result: {
    data: {
      getSystemRoles: [
        {
          value: 'FIELD_AGENT',
          roles: [
            {
              labels: [
                {
                  lang: 'en',
                  label: 'Healthcare Worker'
                },
                {
                  lang: 'fr',
                  label: 'Professionnel de Santé'
                }
              ]
            },
            {
              labels: [
                {
                  lang: 'en',
                  label: 'Police Officer'
                },
                {
                  lang: 'fr',
                  label: 'Agent de Police'
                }
              ]
            },
            {
              labels: [
                {
                  lang: 'en',
                  label: 'Social Worker'
                },
                {
                  lang: 'fr',
                  label: 'Travailleur Social'
                }
              ]
            },
            {
              labels: [
                {
                  lang: 'en',
                  label: 'Local Leader'
                },
                {
                  lang: 'fr',
                  label: 'Leader Local'
                }
              ]
            }
          ],
          active: true
        },
        {
          value: 'REGISTRATION_AGENT',
          roles: [
            {
              lang: 'en',
              label: 'Registration Agent'
            },
            {
              lang: 'fr',
              label: "Agent d'enregistrement"
            }
          ],
          active: true
        },
        {
          value: 'LOCAL_REGISTRAR',
          roles: [
            {
              lang: 'en',
              label: 'Local Registrar'
            },
            {
              lang: 'fr',
              label: 'Registraire local'
            }
          ],
          active: true
        },
        {
          value: 'LOCAL_SYSTEM_ADMIN',
          roles: [
            {
              lang: 'en',
              label: 'Local System_admin'
            },
            {
              lang: 'fr',
              label: 'Administrateur système local'
            }
          ],
          active: true
        },
        {
          value: 'NATIONAL_SYSTEM_ADMIN',
          roles: [
            {
              lang: 'en',
              label: 'National System_admin'
            },
            {
              lang: 'fr',
              label: 'Administrateur système national'
            }
          ],
          active: true
        },
        {
          value: 'PERFORMANCE_MANAGEMENT',
          roles: [
            {
              lang: 'en',
              label: 'Performance Management'
            },
            {
              lang: 'fr',
              label: 'Gestion des performances'
            }
          ],
          active: true
        },
        {
          value: 'NATIONAL_REGISTRAR',
          roles: [
            {
              lang: 'en',
              label: 'National Registrar'
            },
            {
              lang: 'fr',
              label: 'Registraire national'
            }
          ],
          active: true
        }
      ]
    }
  }
}

export const mockCompleteFormData = {
  accountDetails: '',
  assignedRegistrationOffice: '',
  device: '',
  familyName: 'হোসেন',
  familyNameEng: 'Hossain',
  firstNames: 'Jeff',
  firstNamesEng: 'Jeff',
  nid: '123456789',
  phoneNumber: '01662132132',
  email: 'jeff.hossain@gmail.com',
  registrationOffice: '895cc945-94a9-4195-9a29-22e9310f3385',
  systemRole: 'FIELD_AGENT',
  role: 'HOSPITAL',
  userDetails: '',
  username: ''
}

export const mockUserGraphqlOperation = {
  request: {
    query: createOrUpdateUserMutation,
    variables: draftToGqlTransformer(
      {
        sections: [
          deserializeFormSection(
            {
              id: 'user' as Section,
              viewType: 'form',
              name: {
                defaultMessage: 'User',
                description: 'The name of the user form',
                id: 'constants.user'
              },
              title: {
                defaultMessage: 'Create new user',
                description: 'The title of user form',
                id: 'form.section.user.title'
              },
              groups: [
                {
                  id: 'registration-office',
                  title: {
                    defaultMessage: 'Assigned Registration Office',
                    description: 'Assigned Registration Office section',
                    id: 'form.section.assignedRegistrationOffice'
                  },
                  conditionals: [
                    {
                      action: 'hide',
                      expression:
                        'values.skippedOfficeSelction && values.registrationOffice'
                    }
                  ],
                  fields: [
                    {
                      name: 'assignedRegistrationOffice',
                      type: 'FIELD_GROUP_TITLE',
                      label: {
                        defaultMessage: 'Assigned registration office',
                        description: 'Assigned Registration Office section',
                        id: 'form.section.assignedRegistrationOfficeGroupTitle'
                      },
                      required: false,
                      hidden: true,
                      initialValue: '',
                      validator: []
                    },
                    {
                      name: 'registrationOffice',
                      type: 'LOCATION_SEARCH_INPUT',
                      label: {
                        defaultMessage: 'Registration Office',
                        description: 'Registration office',
                        id: 'form.field.label.registrationOffice'
                      },
                      required: true,
                      initialValue: '',
                      searchableResource: ['facilities'],
                      searchableType: ['CRVS_OFFICE'],
                      locationList: [],
                      validator: [
                        {
                          operation: 'officeMustBeSelected'
                        }
                      ],
                      mapping: {
                        mutation: {
                          operation: 'fieldNameTransformer',
                          parameters: ['primaryOffice']
                        },
                        query: {
                          operation: 'locationIDToFieldTransformer',
                          parameters: ['primaryOffice']
                        }
                      }
                    }
                  ]
                },
                {
                  id: 'user-view-group',
                  fields: [
                    {
                      name: 'userDetails',
                      type: 'FIELD_GROUP_TITLE',
                      label: {
                        defaultMessage: 'User details',
                        description: 'User details section',
                        id: 'form.section.userDetails'
                      },
                      required: false,
                      initialValue: '',
                      validator: []
                    },
                    {
                      name: 'firstNames',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'Bengali first name',
                        description: 'Bengali first name',
                        id: 'form.field.label.firstNameBN'
                      },
                      required: false,
                      initialValue: '',
                      validator: [{ operation: 'bengaliOnlyNameFormat' }],
                      mapping: {
                        mutation: {
                          operation: 'fieldToNameTransformer',
                          parameters: ['bn']
                        },
                        query: {
                          operation: 'nameToFieldTransformer',
                          parameters: ['bn']
                        }
                      }
                    },
                    {
                      name: 'familyName',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'Bengali last name',
                        description: 'Bengali last name',
                        id: 'form.field.label.lastNameBN'
                      },
                      required: true,
                      initialValue: '',
                      validator: [{ operation: 'bengaliOnlyNameFormat' }],
                      mapping: {
                        mutation: {
                          operation: 'fieldToNameTransformer',
                          parameters: ['bn']
                        },
                        query: {
                          operation: 'nameToFieldTransformer',
                          parameters: ['bn']
                        }
                      }
                    },
                    {
                      name: 'firstNamesEng',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'English first name',
                        description: 'English first name',
                        id: 'form.field.label.firstNameEN'
                      },
                      required: false,
                      initialValue: '',
                      validator: [{ operation: 'englishOnlyNameFormat' }],
                      mapping: {
                        mutation: {
                          operation: 'fieldToNameTransformer',
                          parameters: ['en', 'firstNames']
                        },
                        query: {
                          operation: 'nameToFieldTransformer',
                          parameters: ['en', 'firstNames']
                        }
                      }
                    },
                    {
                      name: 'familyNameEng',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'English last name',
                        description: 'English last name',
                        id: 'form.field.label.lastNameEN'
                      },
                      required: true,
                      initialValue: '',
                      validator: [{ operation: 'englishOnlyNameFormat' }],
                      mapping: {
                        mutation: {
                          operation: 'fieldToNameTransformer',
                          parameters: ['en', 'familyName']
                        },
                        query: {
                          operation: 'nameToFieldTransformer',
                          parameters: ['en', 'familyName']
                        }
                      }
                    },
                    {
                      name: 'phoneNumber',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'Phone number',
                        description: 'Input label for phone input',
                        id: 'form.field.label.phoneNumber'
                      },
                      required: true,
                      initialValue: '',
                      validator: [{ operation: 'phoneNumberFormat' }],
                      mapping: {
                        mutation: {
                          operation: 'msisdnTransformer',
                          parameters: ['user.mobile']
                        },
                        query: {
                          operation: 'localPhoneTransformer',
                          parameters: ['user.mobile']
                        }
                      }
                    },
                    {
                      name: 'nid',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'NID',
                        description: 'National ID',
                        id: 'form.field.label.NID'
                      },
                      required: true,
                      initialValue: '',
                      validator: [
                        {
                          operation: 'validIDNumber',
                          parameters: ['NATIONAL_ID']
                        }
                      ],
                      mapping: {
                        mutation: {
                          operation: 'fieldToIdentifierWithTypeTransformer',
                          parameters: ['NATIONAL_ID']
                        },
                        query: {
                          operation: 'identifierWithTypeToFieldTransformer',
                          parameters: ['NATIONAL_ID']
                        }
                      }
                    },
                    {
                      name: 'accountDetails',
                      type: 'FIELD_GROUP_TITLE',
                      label: {
                        defaultMessage: 'Account details',
                        description: 'Account details section',
                        id: 'form.section.accountDetails'
                      },
                      required: false,
                      initialValue: '',
                      validator: []
                    },
                    {
                      name: 'systemRole',
                      type: 'SELECT_WITH_OPTIONS',
                      label: {
                        defaultMessage: 'Role',
                        description: 'Role label',
                        id: 'constants.role'
                      },
                      required: true,
                      initialValue: '',
                      validator: [],
                      options: []
                    },
                    {
                      name: 'role',
                      type: 'SELECT_WITH_DYNAMIC_OPTIONS',
                      label: {
                        defaultMessage: 'Type',
                        description:
                          'Label for type of event in work queue list item',
                        id: 'constants.type'
                      },
                      required: true,
                      initialValue: '',
                      validator: [],
                      dynamicOptions: {
                        dependency: 'systemRole',
                        options: {}
                      }
                    },
                    {
                      name: 'device',
                      type: 'TEXT',
                      label: {
                        defaultMessage: 'Device',
                        description: 'User device',
                        id: 'form.field.label.userDevice'
                      },
                      required: false,
                      initialValue: '',
                      validator: []
                    }
                  ]
                },
                {
                  id: 'signature-attachment',
                  title: {
                    defaultMessage: 'Attach the signature',
                    description: 'Title for user signature attachment',
                    id: 'form.field.label.userSignatureAttachmentTitle'
                  },
                  conditionals: [
                    {
                      action: 'hide',
                      expression:
                        'values.systemRole!=="LOCAL_REGISTRAR" && values.systemRole!=="REGISTRATION_AGENT"'
                    }
                  ],
                  fields: [
                    {
                      name: 'attachmentTitle',
                      type: 'FIELD_GROUP_TITLE',
                      hidden: true,
                      label: {
                        defaultMessage: 'Attachments',
                        description: 'label for user signature attachment',
                        id: 'form.field.label.userAttachmentSection'
                      },
                      required: false,
                      initialValue: '',
                      validator: []
                    },
                    {
                      name: 'signature',
                      type: 'SIMPLE_DOCUMENT_UPLOADER',
                      label: {
                        defaultMessage: 'User’s signature',
                        description:
                          'Input label for user signature attachment',
                        id: 'form.field.label.userSignatureAttachment'
                      },
                      description: {
                        defaultMessage:
                          'Ask the user to sign a piece of paper and then scan or take a photo.',
                        description:
                          'Description for user signature attachment',
                        id: 'form.field.label.userSignatureAttachmentDesc'
                      },
                      allowedDocType: ['image/png'],
                      initialValue: '',
                      required: false,
                      validator: []
                    }
                  ]
                }
              ]
            },
            builtInValidators as any
          )
        ]
      },
      { user: mockCompleteFormData }
    )
  },
  result: {
    data: {
      createOrUpdateUserMutation: { username: 'hossain123', __typename: 'User' }
    }
  }
}

export const mockDataWithRegistarRoleSelected = {
  accountDetails: '',
  assignedRegistrationOffice: '',
  device: '',
  familyName: 'হোসেন',
  familyNameEng: 'Hossain',
  firstNames: 'Jeff',
  firstNamesEng: 'Jeff',
  email: 'jeff@gmail.com',
  nid: '101488192',
  phoneNumber: '01662132132',
  registrationOffice: '895cc945-94a9-4195-9a29-22e9310f3385',
  systemRole: 'LOCAL_REGISTRAR',
  role: 'SECRETARY',
  userDetails: '',
  username: '',
  signature: {
    type: 'image/png',
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUt'
  }
}

export {
  mockOfflineData,
  mockOfflineLocationsWithHierarchy
} from './mock-offline-data'
