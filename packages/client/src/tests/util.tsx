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
import { App } from '@client/App'
import { Event, ISerializedForm } from '@client/forms'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { getDefaultLanguage } from '@client/i18n/utils'
import { offlineDataReady, setOfflineData } from '@client/offline/actions'
import { AppStore, createStore, IStoreState } from '@client/store'
import { ThemeProvider } from '@client/styledComponents'
import { getSchema } from '@client/tests/graphql-schema-mock'
import { I18nContainer } from '@opencrvs/client/src/i18n/components/I18nContainer'
import { getTheme } from '@opencrvs/components/lib/theme'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient, { NetworkStatus } from 'apollo-client'
import { ApolloLink, Observable } from 'apollo-link'
import {
  configure,
  mount,
  ReactWrapper,
  shallow,
  MountRendererProps
} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { readFileSync } from 'fs'
import { join } from 'path'
import { graphql, print } from 'graphql'
import * as jwt from 'jsonwebtoken'
import * as React from 'react'
import { ApolloProvider } from 'react-apollo'
import { MockedProvider } from 'react-apollo/test-utils'
import { IntlShape } from 'react-intl'
import { Provider } from 'react-redux'
import { AnyAction, Store } from 'redux'
import { waitForElement } from './wait-for-element'
import { setUserDetails } from '@client/profile/profileActions'
import {
  createBrowserHistory,
  createLocation,
  createMemoryHistory,
  History
} from 'history'
import { stringify } from 'query-string'
import { match as Match } from 'react-router'
import { ConnectedRouter } from 'connected-react-router'
import { IVerifyIDCertificateCollectorDefinition } from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { mockOfflineData } from './mock-offline-data'

export const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
export const registrationClerkScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJ2YWxpZGF0ZSIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU3ODMwNzgzOSwiZXhwIjoxNTc4OTEyNjM5LCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6cmVzb3VyY2VzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNWRmYmE5NDYxMTEyNTliZDBjMzhhY2JhIn0.CFUy-L414-8MLf6pjA8EapK6qN1yYN6Y0ywcg1GtWhRxSWnT0Kw9d2OOK_IVFBAqTXLROQcwHYnXC2r6Ka53MB14HUZ39H7HrOTFURCYknYGIeGmyFpBjoXUj4yc95_f1FCpW6fQReBMnSIzUwlUGcxK-ttitSLfQebPFaVosM6kQpKd-n5g6cg6eS9hsYzxVme9kKkrxy5HRkxjNe8VfXEheKGqpRHxLGP7bo1bIhw8BWto9kT2kxm0NLkWzbqhxKyVrk8cEdcFiIAbUt6Fzjcx_uVPvLnJPNQAkZEO3AdqbZDFuvmBQWCf2Z6l9c8fYuWRD4SA5tBCcIKzUcalEg'
export const fieldAgentScopeToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NjQ5OTgyNzUsImV4cCI6MTU5NjUzNDI3NSwiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydkZWNsYXJlJ10ifQ.uriNBNUYD9xColqKq7FraHf8X8b1erMXqRkyzRDJzQk'
export const validToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'
export const sysadminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJzeXNhZG1pbiIsImRlbW8iXSwiaWF0IjoxNTU5MTk5MTE3LCJleHAiOjE1NTk4MDM5MTcsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpyZXNvdXJjZXMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1Y2VlNmM1MzU0NWRjMTYwYTIyODQyYjQifQ.Typ3XPwbfofrvWrYuWWHBEIuhzUypsSlTpPZUionO1SxTcAGbm0msn0chpdMw6AJtV0JbC0u-7lpmzpbpHjeQ98emt29pez1EteP8ZapQQmivT55DnwB0_YRg4BdlBGC561aOf6btnFtQsMULhJ8DkPNWUaa-a5_8gPEZmpUVExUw1yslGNCsGwPoNkEEcpXZ8dc-QWXWOFz7eEvKUAXTiLzOQFt4ea7BjU0fVBgMpLr5JmK42OAU3k6xvJHLNM3b8OlPm3fsmsfqZY7_n7L7y7ia5lKFAuFf33pii1_VtG-NZKhu8OecioOpb8ShIqHseU0sDFl58tIf7o1uMS9DQ'
export const validImageB64String =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
export const inValidImageB64String =
  'wee7dfaKGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
export const natlSysAdminToken =
  'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJzeXNhZG1pbiIsIm5hdGxzeXNhZG1pbiIsImRlbW8iXSwiaWF0IjoxNjQ5NjU3MTM4LCJleHAiOjE2NTAyNjE5MzgsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjIyZjgxYjQyY2Q1MzdiZjkxZGFhMTBiIn0.MojnxjSVja4VkS5ufVtpJHmiqQqngW3Zb6rHv4MqKwqSgHptjta1A-1xdpkfadxr0pVIYTh-rhKP93LPCTfThkA01oW8qgkUr0t_02cgJ5KLe1B3R5QFJ9i1IzLye9yOeakfpbtnk67cwJ2r4KTJMxj5BWucdPGK8ifZRBdDrt9HsTtcDOutgLmEp2VnxLvc2eAEmoBBp6mRZ8lOYIRei5UHfaROCk0vdwjLchiqQWH9GE8hxU3RIA1jpzshd3_TC4G0rvuIXnBGf9VQaH-gkNW7a44xLVHhdENxAsGTdyeSHRC83wbeoUZkuOFQpF8Iz-8SbLEQfmipdzeBAsBgWg'
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

export const getItem = window.localStorage.getItem as jest.Mock
export const setItem = window.localStorage.setItem as jest.Mock

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
  const { store, history } = createStore()
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

export const wait = () => new Promise((res) => process.nextTick(res))

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

export const graphQLEventLocationAddressMock = {
  id: 'd3225149-d28a-4cc6-be41-4ba89d165ad3',
  type: 'PRIVATE_HOME',
  address: {
    type: null,
    line: ['', '', '', '', '', '', 'URBAN'],
    district: '852b103f-2fe0-4871-a323-51e51c6d9198',
    state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
    city: null,
    postalCode: null,
    country: 'FAR',
    __typename: 'Address'
  },
  __typename: 'Location'
}

export const graphQLPersonAddressMock = [
  {
    type: 'PRIMARY_ADDRESS',
    line: ['', '', '', '', '', '', 'URBAN'],
    district: '852b103f-2fe0-4871-a323-51e51c6d9198',
    state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
    city: null,
    postalCode: null,
    country: 'FAR',
    __typename: 'Address'
  },
  {
    type: 'SECONDARY_ADDRESS',
    line: ['', '', '', '', '', '', 'URBAN'],
    district: '852b103f-2fe0-4871-a323-51e51c6d9198',
    state: 'bac22b09-1260-4a59-a5b9-c56c43ae889c',
    city: null,
    postalCode: null,
    country: 'FAR',
    __typename: 'Address'
  }
]

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
  internationalPostcode: ''
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
  postcodePrimary: '',
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
  postcodeSecondary: 'my secondary postcode',
  addressLine5Secondary: ''
}

export const primaryInternationalAddressLines = {
  internationalStatePrimary: 'ujggiu',
  internationalDistrictPrimary: 'iuoug',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostcodePrimary: ''
}

export const secondaryInternationalAddressLines = {
  internationalStateSecondary: 'ugou',
  internationalDistrictSecondary: 'iugoug',
  internationalCitySecondary: '',
  internationalAddressLine1Secondary: '',
  internationalAddressLine2Secondary: '',
  internationalAddressLine3Secondary: '',
  internationalPostcodeSecondary: ''
}

// This object has more than 10 drafts to utilize pagination testing in draft tab
export const currentUserDeclarations = {
  userID: currentUserId,
  declarations: [
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871160',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: 'Rafiq',
          familyNameEng: 'Islam',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: '78f2f8a7-5daa-4fdc-918c-d386036c3e56',
      data: {
        child: {
          firstNames: '',
          familyName: 'পল',
          firstNamesEng: '',
          familyNameEng: 'Paul',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          motherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        '': {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558419428583,
      modifiedOn: 1558419488611
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871161',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: 'Rafiq',
          familyNameEng: 'Islam',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871162',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: 'Rafiq',
          familyNameEng: 'Islam',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871163',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: 'Rafiq',
          familyNameEng: 'Islam',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871164',
      data: {
        child: {
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871167',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: 'Rafiq',
          familyNameEng: 'Islam',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c487116',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: '',
          familyNameEng: '',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: 'b77b78af-a259-4bc1-85d5-b1e8c1382271',
      data: {
        deceased: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212121211111,
          fetchButton: '',
          firstNames: '',
          familyName: 'ইসলাম',
          firstNamesEng: '',
          familyNameEng: '',
          nationality: 'BGD',
          gender: 'male',
          maritalStatus: 'MARRIED',
          birthDate: '1940-01-01',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          informantID: 1111111111111,
          fetchButton: '',
          informantFirstNames: 'স্যাম',
          informantFamilyName: 'পল',
          informantFirstNamesEng: 'Sam',
          informantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          informantBirthDate: '2000-01-01',
          relationship: 'OTHER',
          informantPhone: '01711111111',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          placeOfDeath: 'PRIMARY_ADDRESS',
          deathLocation: '',
          ...eventAddressData
        },
        causeOfDeath: {
          causeOfDeathEstablished: false,
          methodOfCauseOfDeath: '',
          causeOfDeathCode: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'death',
      submissionStatus: 'DRAFT',
      savedOn: 1558532017732,
      modifiedOn: 1558532146774
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871167',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: 'Rafiq',
          familyNameEng: 'Islam',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: '72c18939-70c1-40b4-9b80-b162c4871168',
      data: {
        child: {
          firstNames: 'রফিক',
          familyName: 'ইসলাম',
          firstNamesEng: 'Rafiq',
          familyNameEng: 'Islam',
          gender: 'male',
          childBirthDate: '2010-01-01',
          attendantAtBirth: '',
          birthType: '',
          multipleBirth: 1,
          weightAtBirth: '',
          placeOfBirth: '',
          birthLocation: '',
          ...eventAddressData
        },
        mother: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212312331212,
          fetchButton: '',
          nationality: 'BGD',
          firstNames: 'বেগম',
          familyName: 'রোকেয়া',
          firstNamesEng: 'Begum',
          familyNameEng: 'Rokeya',
          motherBirthDate: '1980-01-01',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          educationalAttainment: '',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        father: {
          detailsExist: false,
          iDType: '',
          iDTypeOther: '',
          iD: '',
          fetchButton: '',
          nationality: 'BGD',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          fatherBirthDate: '',
          maritalStatus: 'MARRIED',
          dateOfMarriage: '',
          primaryAddressSameAsOtherPrimary: true,
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        registration: {
          informantType: '',
          whoseContactDetails: '',
          registrationPhone: '01711111111',
          phoneVerificationWarning: '',
          commentsOrNotes: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'birth',
      submissionStatus: 'DRAFT',
      savedOn: 1558418612279,
      modifiedOn: 1558418756714
    },
    {
      id: 'b77b78af-a259-4bc1-85d5-b1e8c1382272',
      data: {
        deceased: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212121211111,
          fetchButton: '',
          firstNames: '',
          familyName: 'ইসলাম',
          firstNamesEng: '',
          familyNameEng: '',
          nationality: 'BGD',
          gender: 'male',
          maritalStatus: 'MARRIED',
          birthDate: '1940-01-01',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          informantID: 1111111111111,
          fetchButton: '',
          informantFirstNames: 'স্যাম',
          informantFamilyName: 'পল',
          informantFirstNamesEng: 'Sam',
          informantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          informantBirthDate: '2000-01-01',
          relationship: 'SON',
          informantPhone: '01711111111',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          placeOfDeath: 'PRIMARY_ADDRESS',
          deathLocation: '',
          ...eventAddressData
        },
        causeOfDeath: {
          causeOfDeathEstablished: false,
          methodOfCauseOfDeath: '',
          causeOfDeathCode: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'death',
      submissionStatus: 'DRAFT',
      savedOn: 1558532017732,
      modifiedOn: 1558532146774
    },
    {
      id: 'b77b78af-a259-4bc1-85d5-b1e8c1382273',
      data: {
        deceased: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212121211112,
          fetchButton: '',
          firstNames: '',
          familyName: 'ইসলাম',
          firstNamesEng: '',
          familyNameEng: 'Islam',
          nationality: 'BGD',
          gender: 'male',
          maritalStatus: 'MARRIED',
          birthDate: '1940-01-01',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          informantID: 1111111111111,
          fetchButton: '',
          informantFirstNames: 'স্যাম',
          informantFamilyName: 'পল',
          informantFirstNamesEng: 'Sam',
          informantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          informantBirthDate: '2000-01-01',
          relationship: 'SON',
          informantPhone: '01711111111',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          placeOfDeath: 'PRIMARY_ADDRESS',
          deathLocation: '',
          ...eventAddressData
        },
        causeOfDeath: {
          causeOfDeathEstablished: false,
          methodOfCauseOfDeath: '',
          causeOfDeathCode: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'death',
      submissionStatus: 'DRAFT',
      savedOn: 1558532017732,
      modifiedOn: 1558532146774
    },
    {
      id: 'b77b78af-a259-4bc1-85d5-b1e8c1382273',
      data: {
        deceased: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          iD: 1212121211112,
          fetchButton: '',
          firstNames: '',
          familyName: '',
          firstNamesEng: '',
          familyNameEng: '',
          nationality: 'BGD',
          gender: 'male',
          maritalStatus: 'MARRIED',
          birthDate: '1940-01-01',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          informantID: 1111111111111,
          fetchButton: '',
          informantFirstNames: 'স্যাম',
          informantFamilyName: 'পল',
          informantFirstNamesEng: 'Sam',
          informantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          informantBirthDate: '2000-01-01',
          relationship: 'SON',
          ...primaryAddressData,
          ...primaryInternationalAddressLines,
          ...secondaryAddressData,
          ...secondaryInternationalAddressLines
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          placeOfDeath: 'PRIMARY_ADDRESS',
          deathLocation: '',
          ...eventAddressData
        },
        causeOfDeath: {
          causeOfDeathEstablished: false,
          methodOfCauseOfDeath: '',
          causeOfDeathCode: ''
        },
        documents: { imageUploader: '', paragraph: '', list: '' },
        preview: {}
      },
      event: 'death',
      submissionStatus: 'DRAFT',
      savedOn: 1558532017732
    }
  ]
}

export const userDetails = {
  userMgntUserID: '123',
  language: 'en',
  name: [
    {
      use: 'en',
      firstNames: 'Shakib',
      familyName: 'Al Hasan'
    },
    { use: 'bn', firstNames: '', familyName: '' }
  ],
  role: 'FIELD_AGENT',
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
      }
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
      role: 'LOCAL_SYSTEM_ADMIN',
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
      role: 'LOCAL_REGISTRAR',
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
    ...primaryAddressData,
    ...primaryInternationalAddressLines,
    ...secondaryAddressData,
    ...secondaryInternationalAddressLines
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
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    ...primaryAddressData,
    ...primaryInternationalAddressLines,
    ...secondaryAddressData,
    ...secondaryInternationalAddressLines,
    primaryAddressSameAsOtherPrimary: true
  },
  registration: {
    whoseContactDetails: {
      value: 'MOTHER',
      nestedFields: { registrationPhone: '01557394986' }
    },
    informantType: {
      value: 'MOTHER',
      nestedFields: { otherInformantType: '' }
    },
    registrationNumber: '201908122365BDSS0SE1',
    regStatus: {
      type: 'REGISTERED',
      officeName: 'MokhtarPur',
      officeAlias: 'মখতারপুর',
      officeAddressLevel3: 'Gazipur',
      officeAddressLevel4: 'Dhaka'
    },
    certificates: [{}]
  }
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
    ...primaryAddressData,
    ...primaryInternationalAddressLines,
    ...secondaryAddressData,
    ...secondaryInternationalAddressLines
  },
  informant: {
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
    ...primaryAddressData,
    ...primaryInternationalAddressLines,
    ...secondaryAddressData,
    ...secondaryInternationalAddressLines
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
    ...eventAddressData
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
    registrationPhone: '01557394986',
    registrationNumber: '201908122365DDSS0SE1',
    contact: 'OTHER',
    contactPhoneNumber: '+8801671010143',
    contactRelationship: 'Friend',
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

export const mockBirthRegistrationSectionData = {
  whoseContactDetails: {
    value: 'MOTHER',
    nestedFields: { registrationPhone: '01557394986' }
  },
  informantType: {
    value: 'MOTHER',
    nestedFields: { otherInformantType: '' }
  },
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
  whoseContactDetails: 'MOTHER',
  informantType: {
    value: 'MOTHER',
    nestedFields: { otherInformantType: '' }
  },
  registrationPhone: '01557394986',
  trackingId: 'DDSS0SE',
  registrationNumber: '201908122365DDSS0SE1',
  contact: 'OTHER',
  contactPhoneNumber: '+8801671010143',
  contactRelationship: 'Friend',
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

export const mockFetchCertificatesTemplatesDefinition = [
  {
    _id: '12313546',
    event: 'birth',
    status: 'ACTIVE',
    svgCode:
      '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="209.884" y="549.336">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="210" y="445.552">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Died on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of death&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="211" y="384.004">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfDeath}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Death Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
    svgDateCreated: 1640696680593,
    svgDateUpdated: 1644326332088,
    svgFilename: 'oCRVS_DefaultZambia_Death_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  },
  {
    _id: '25313546',
    event: 'death',
    status: 'ACTIVE',
    svgCode:
      '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Was born on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of birth&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfBirth}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Birth Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
    svgDateCreated: 1640696804785,
    svgDateUpdated: 1643885502999,
    svgFilename: 'oCRVS_DefaultZambia_Birth_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  }
]

export const mockConfigResponse = {
  config: mockOfflineData.config,
  certificates: mockFetchCertificatesTemplatesDefinition
}

export async function createTestStore() {
  const { store, history } = createStore()
  await store.dispatch(
    offlineDataReady({
      languages: mockOfflineData.languages,
      forms: mockOfflineData.forms,
      templates: mockOfflineData.templates,
      locations: mockOfflineData.locations,
      facilities: mockOfflineData.facilities,
      pilotLocations: mockOfflineData.pilotLocations,
      offices: mockOfflineData.offices,
      assets: mockOfflineData.assets,
      config: mockOfflineData.config,
      formConfig: mockOfflineData.formConfig
    })
  )
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
  await store.dispatch(
    offlineDataReady({
      languages: mockOfflineData.languages,
      forms: mockOfflineData.forms,
      templates: mockOfflineData.templates,
      locations: mockOfflineData.locations,
      facilities: mockOfflineData.facilities,
      pilotLocations: mockOfflineData.pilotLocations,
      offices: mockOfflineData.offices,
      assets: mockOfflineData.assets,
      config: mockOfflineData.config,
      formConfig: mockOfflineData.formConfig
    })
  )

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
            <ThemeProvider theme={getTheme(getDefaultLanguage())}>
              <node.type {...node.props} {...props} />
            </ThemeProvider>
          </I18nContainer>
        </ConnectedRouter>
      </Provider>
    )
  }

  return mount(<PropProxy {...node.props} />, options)
}

export const mockDeathDeclarationDataWithoutFirstNames = {
  deceased: {
    iDType: 'NATIONAL_ID',
    iD: '1230000000000',
    firstNames: '',
    familyName: 'ইসলাম',
    firstNamesEng: '',
    familyNameEng: 'Islam',
    nationality: 'BGD',
    gender: 'male',
    maritalStatus: 'MARRIED',
    birthDate: '1987-02-16',
    primaryAddress: '',
    countryPrimary: 'BGD',
    statePrimary: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    districtPrimary: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4Primary: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3Primary: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2Primary: '193 Kalibari Road',
    addressLine1Primary: '193 Kalibari Road',
    postCodePrimary: '2200',
    secondaryAddress: '',
    country: 'BGD',
    state: '',
    district: '',
    addressLine4: '',
    addressLine3: '',
    addressLine2: '',
    addressLine1: '',
    postCode: ''
  },
  informant: {
    informantIdType: 'NATIONAL_ID',
    iDType: 'NATIONAL_ID',
    informantID: '1230000000000',
    informantFirstNames: '',
    informantFamilyName: 'ইসলাম',
    informantFirstNamesEng: 'Islam',
    informantFamilyNameEng: 'Islam',
    nationality: 'BGD',
    informantBirthDate: '',
    relationship: 'SPOUSE',
    secondaryAddress: '',
    country: 'BGD',
    state: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    district: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2: '',
    addressLine1: '193 Kalibari Road',
    postCode: '2200',
    primaryAddress: '',
    informantPrimaryAddressSameAsCurrent: true,
    countryPrimary: 'BGD',
    statePrimary: '',
    districtPrimary: '',
    addressLine4Primary: '',
    addressLine3Primary: '',
    addressLine2Primary: '',
    addressLine1Primary: '',
    postCodePrimary: ''
  },
  deathEvent: {
    deathDate: '1987-02-16',
    manner: 'ACCIDENT',
    deathPlace: '',
    placeOfDeath: 'OTHER',
    deathLocation: '',
    addressType: '',
    country: 'BGD',
    state: 'state',
    district: 'district',
    addressLine4: 'upazila',
    addressLine3: 'union',
    addressLine2: '',
    addressLine1: '',
    postCode: ''
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
  }
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
  await goToSection(component, 3)
  await waitForElement(component, '#form_section_id_documents-view-group')
}

export async function goToFatherSection(component: ReactWrapper) {
  await goToSection(component, 2)
  await waitForElement(component, '#form_section_id_father-view-group')
}

export async function goToMotherSection(component: ReactWrapper) {
  await goToSection(component, 1)
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

export async function setPinCode(component: ReactWrapper) {
  component.find('#createPinBtn').hostNodes().simulate('click')

  for (let i = 1; i <= 8; i++) {
    component
      .find(`#keypad-${i % 2}`)
      .hostNodes()
      .simulate('click')
  }
  await flushPromises()
  component.update()
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
      stale: false,
      data: {
        getUser: {
          userMgntUserID: '5eba726866458970cf2e23c2',
          practitionerId: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
          mobile: '+8801711111111',
          role: 'FIELD_AGENT',
          type: 'CHA',
          status: 'active',
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
            status: 'active'
          },
          localRegistrar: {
            name: [
              {
                use: 'en',
                firstNames: 'Mohammad',
                familyName: 'Ashraful'
              }
            ],
            role: 'LOCAL_REGISTRAR',
            signature: undefined
          }
        }
      }
    })
  )
}

export function createRouterProps<T, Params>(
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

export { mockOfflineData } from './mock-offline-data'
