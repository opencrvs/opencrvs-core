import * as jwt from 'jsonwebtoken'
import * as React from 'react'
import { Provider } from 'react-redux'
import { graphql, print } from 'graphql'
import ApolloClient from 'apollo-client'
import { MockedProvider } from 'react-apollo/test-utils'
import { ApolloLink, Observable } from 'apollo-link'
import { IStoreState, createStore, AppStore } from '@register/store'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { mount, configure, shallow, ReactWrapper } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { App } from '@register/App'
import { getSchema } from '@register/tests/graphql-schema-mock'
import { ThemeProvider } from '@register/styledComponents'
import { getTheme } from '@opencrvs/components/lib/theme'
import { I18nContainer } from '@opencrvs/register/src/i18n/components/I18nContainer'
import { getDefaultLanguage } from '@register/i18n/utils'
import { waitForElement } from './wait-for-element'
import { readFileSync } from 'fs'

import { offlineDataReady, setOfflineData } from '@register/offline/actions'
import { ISerializedForm, Event } from '@register/forms'
import { Store, AnyAction } from 'redux'
import { getRegisterForm } from '@register/forms/register/application-selectors'
import { getReviewForm } from '@register/forms/register/review-selectors'
import { IntlShape } from 'react-intl'

export const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
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
  return new Promise(resolve => setImmediate(resolve))
}
export const assign = window.location.assign as jest.Mock
export const getItem = window.localStorage.getItem as jest.Mock
export const setItem = window.localStorage.setItem as jest.Mock

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

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}

export function waitForReady(app: ReactWrapper) {
  return waitForElement(app, '#readyApplication')
}

export async function createTestApp(
  config = { waitUntilResourcesLoaded: true }
) {
  const { store, history } = createStore()
  const app = mount(
    <App store={store} history={history} client={createGraphQLClient()} />
  )

  if (config.waitUntilResourcesLoaded) {
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

export const wait = () => new Promise(res => process.nextTick(res))

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

const currentUserId = '123'

// This object has more than 10 drafts to utilize pagination testing in draft tab
export const currentUserApplications = {
  userID: currentUserId,
  applications: [
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddress: '',
          currentAddressSameAsPermanent: true,
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          applicantID: 1111111111111,
          fetchButton: '',
          applicantFirstNames: 'স্যাম',
          applicantFamilyName: 'পল',
          applicantFirstNamesEng: 'Sam',
          applicantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          applicantBirthDate: '2000-01-01',
          applicantsRelationToDeceased: 'EXTENDED_FAMILY',
          applicantOtherRelationship: '',
          applicantPhone: '01711111111',
          currentAddress: '',
          country: 'BGD',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddress: '',
          applicantPermanentAddressSameAsCurrent: true,
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          deathPlaceAddress: 'PERMANENT',
          placeOfDeath: '',
          deathLocation: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddressSameAsPermanent: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        father: {
          fathersDetailsExist: false,
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
          addressSameAsMother: true,
          currentAddress: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddressSameAsMother: true,
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        registration: {
          presentAtBirthRegistration: '',
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddress: '',
          currentAddressSameAsPermanent: true,
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          applicantID: 1111111111111,
          fetchButton: '',
          applicantFirstNames: 'স্যাম',
          applicantFamilyName: 'পল',
          applicantFirstNamesEng: 'Sam',
          applicantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          applicantBirthDate: '2000-01-01',
          applicantsRelationToDeceased: 'EXTENDED_FAMILY',
          applicantOtherRelationship: '',
          applicantPhone: '01711111111',
          currentAddress: '',
          country: 'BGD',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddress: '',
          applicantPermanentAddressSameAsCurrent: true,
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          deathPlaceAddress: 'PERMANENT',
          placeOfDeath: '',
          deathLocation: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddress: '',
          currentAddressSameAsPermanent: true,
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          applicantID: 1111111111111,
          fetchButton: '',
          applicantFirstNames: 'স্যাম',
          applicantFamilyName: 'পল',
          applicantFirstNamesEng: 'Sam',
          applicantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          applicantBirthDate: '2000-01-01',
          applicantsRelationToDeceased: 'EXTENDED_FAMILY',
          applicantOtherRelationship: '',
          applicantPhone: '01711111111',
          currentAddress: '',
          country: 'BGD',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddress: '',
          applicantPermanentAddressSameAsCurrent: true,
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          deathPlaceAddress: 'PERMANENT',
          placeOfDeath: '',
          deathLocation: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
          permanentAddress: '',
          countryPermanent: 'BGD',
          statePermanent: '9a236522-0c3d-40eb-83ad-e8567518c763',
          districtPermanent: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4Permanent: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: '',
          currentAddress: '',
          currentAddressSameAsPermanent: true,
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
        },
        informant: {
          iDType: 'NATIONAL_ID',
          iDTypeOther: '',
          applicantID: 1111111111111,
          fetchButton: '',
          applicantFirstNames: 'স্যাম',
          applicantFamilyName: 'পল',
          applicantFirstNamesEng: 'Sam',
          applicantFamilyNameEng: 'Paul',
          nationality: 'BGD',
          applicantBirthDate: '2000-01-01',
          applicantsRelationToDeceased: 'EXTENDED_FAMILY',
          applicantOtherRelationship: '',
          applicantPhone: '01711111111',
          currentAddress: '',
          country: 'BGD',
          state: '9a236522-0c3d-40eb-83ad-e8567518c763',
          district: 'c879ce5c-545b-4042-98a6-77015b0e13df',
          addressLine4: 'ee72f497-343f-4f0f-9062-d618fafc175c',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: '',
          permanentAddress: '',
          applicantPermanentAddressSameAsCurrent: true,
          countryPermanent: 'BGD',
          statePermanent: '',
          districtPermanent: '',
          addressLine4Permanent: '',
          addressLine3Permanent: '',
          addressLine3CityOptionPermanent: '',
          addressLine2Permanent: '',
          addressLine1CityOptionPermanent: '',
          postCodeCityOptionPermanent: '',
          addressLine1Permanent: '',
          postCodePermanent: ''
        },
        deathEvent: {
          deathDate: '2010-01-01',
          manner: 'NATURAL_CAUSES',
          deathPlace: '',
          deathPlaceAddress: 'PERMANENT',
          placeOfDeath: '',
          deathLocation: '',
          country: 'BGD',
          state: '',
          district: '',
          addressLine4: '',
          addressLine3: '',
          addressLine3CityOption: '',
          addressLine2: '',
          addressLine1CityOption: '',
          postCodeCityOption: '',
          addressLine1: '',
          postCode: ''
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
  ],
  signature: {
    data: `data:image/png;base64,${validImageB64String}`
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
        data: `data:image/png;base64,${validImageB64String}`
      }
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAo',
        type: 'image/png'
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
    birthType: 'SINGLE',
    multipleBirth: 1
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
    countryPermanent: 'BGD',
    statePermanent: 'state2',
    districtPermanent: 'district2',
    addressLine1Permanent: 'some road',
    addressLine2Permanent: 'some more',
    addressLine3Permanent: 'some more',
    addressLine4Permanent: 'upazila1',
    postalCodePermanent: '',
    country: 'BGD',
    state: 'state2',
    district: 'district2',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: 'upazila2',
    postalCode: '',
    currentAddressSameAsPermanent: true
  },
  father: {
    fathersDetailsExist: true,
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Jeff',
    familyNameEng: 'Test',
    iD: '43A8ZU817',
    iDType: 'PASSPORT',
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
    addressLine3Permanent: '',
    addressLine4Permanent: 'upazila1',
    postalCodePermanent: '',
    country: 'BGD',
    state: 'state2',
    district: 'district2',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: 'upazila2',
    postalCode: '',
    permanentAddressSameAsMother: true,
    addressSameAsMother: true
  },
  registration: {
    whoseContactDetails: 'MOTHER',
    presentAtBirthRegistration: 'BOTH_PARENTS',
    registrationPhone: '01557394986',
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
          type: 'MOTHER'
        },
        hasShowedVerifiedDocument: true
      }
    ]
  }
}

export const mockDeathApplicationData = {
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
    permanentAddress: '',
    countryPermanent: 'BGD',
    statePermanent: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    districtPermanent: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4Permanent: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3Permanent: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2Permanent: '193 Kalibari Road',
    addressLine1Permanent: '193 Kalibari Road',
    postCodePermanent: '2200',
    currentAddress: '',
    currentAddressSameAsPermanent: true,
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
    applicantIdType: 'NATIONAL_ID',
    iDType: 'NATIONAL_ID',
    applicantID: '1230000000000',
    applicantFirstNames: '',
    applicantFamilyName: 'ইসলাম',
    applicantFirstNamesEng: 'Islam',
    applicantFamilyNameEng: 'Islam',
    nationality: 'BGD',
    applicantBirthDate: '',
    applicantsRelationToDeceased: 'MOTHER',
    applicantPhone: '01712345678',
    currentAddress: '',
    country: 'BGD',
    state: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    district: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2: '',
    addressLine1: '193 Kalibari Road',
    postCode: '2200',
    permanentAddress: '',
    applicantPermanentAddressSameAsCurrent: true,
    countryPermanent: 'BGD',
    statePermanent: '',
    districtPermanent: '',
    addressLine4Permanent: '',
    addressLine3Permanent: '',
    addressLine2Permanent: '',
    addressLine1Permanent: '',
    postCodePermanent: ''
  },
  deathEvent: {
    deathDate: '1987-02-16',
    manner: 'ACCIDENT',
    deathPlaceAddress: 'OTHER',
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
  },
  registration: {
    registrationPhone: '01557394986',
    registrationNumber: '201908122365DDSS0SE1',
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
  whoseContactDetails: 'MOTHER',
  presentAtBirthRegistration: 'BOTH_PARENTS',
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
        iD: '123456789'
      },
      hasShowedVerifiedDocument: true
    }
  ]
}

export const mockDeathRegistrationSectionData = {
  whoseContactDetails: 'MOTHER',
  presentAtBirthRegistration: 'BOTH_PARENTS',
  registrationPhone: '01557394986',
  trackingId: 'DDSS0SE',
  registrationNumber: '201908122365DDSS0SE1',
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

export const mockOfflineData = {
  forms: JSON.parse(
    readFileSync('../resources/src/bgd/features/forms/register.json').toString()
  ) as { registerForm: { birth: ISerializedForm; death: ISerializedForm } },
  facilities: {
    '627fc0cc-e0e2-4c09-804d-38a9fa1807ee': {
      id: '627fc0cc-e0e2-4c09-804d-38a9fa1807ee',
      name: 'Shaheed Taj Uddin Ahmad Medical College',
      alias: 'শহীদ তাজউদ্দিন আহমেদ মেডিকেল কলেজ হাসপাতাল',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/3a5358d0-1bcd-4ea9-b0b7-7cfb7cbcbf0f'
    },
    'ae5b4462-d1b2-4b22-b289-a66f912dce73': {
      id: 'ae5b4462-d1b2-4b22-b289-a66f912dce73',
      name: 'Kaliganj Union Sub Center',
      alias: 'কালীগঞ্জ ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    },
    '6abbb7b8-d02e-41cf-8a3e-5039776c1eb0': {
      id: '6abbb7b8-d02e-41cf-8a3e-5039776c1eb0',
      name: 'Kaliganj Upazila Health Complex',
      alias: 'কালীগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    },
    '0d8474da-0361-4d32-979e-af91f020309e': {
      id: '0d8474da-0361-4d32-979e-af91f020309e',
      name: 'Dholashadhukhan Cc',
      alias: 'ধলাশাধুখান সিসি - কালিগঞ্জ',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    }
  },

  locations: {
    '65cf62cb-864c-45e3-9c0d-5c70f0074cb4': {
      id: '65cf62cb-864c-45e3-9c0d-5c70f0074cb4',
      name: 'Barisal',
      alias: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '8cbc862a-b817-4c29-a490-4a8767ff023c': {
      id: '8cbc862a-b817-4c29-a490-4a8767ff023c',
      name: 'Chittagong',
      alias: 'চট্টগ্রাম',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b': {
      id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      name: 'Dhaka',
      alias: 'ঢাকা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '7304b306-1b0d-4640-b668-5bf39bc78f48': {
      id: '7304b306-1b0d-4640-b668-5bf39bc78f48',
      name: 'Khulna',
      alias: 'খুলনা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '75fdf3dc-0dd2-4b65-9c59-3afe5f49fc3a': {
      id: '75fdf3dc-0dd2-4b65-9c59-3afe5f49fc3a',
      name: 'Rajshahi',
      alias: 'রাজশাহী',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '2b55d13f-f700-4373-8255-c0febd4733b6': {
      id: '2b55d13f-f700-4373-8255-c0febd4733b6',
      name: 'Rangpur',
      alias: 'রংপুর',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '59f7f044-84b8-4a6c-955d-271aa3e5af46': {
      id: '59f7f044-84b8-4a6c-955d-271aa3e5af46',
      name: 'Sylhet',
      alias: 'সিলেট',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    '237f3404-d417-41fe-9130-3d049800a1e5': {
      id: '237f3404-d417-41fe-9130-3d049800a1e5',
      name: 'Mymensingh',
      alias: 'ময়মনসিংহ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    'bc4b9f99-0db3-4815-926d-89fd56889407': {
      id: 'bc4b9f99-0db3-4815-926d-89fd56889407',
      name: 'BARGUNA',
      alias: 'বরগুনা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    'dabffdf7-c174-4450-b306-5a3c2c0e2c0e': {
      id: 'dabffdf7-c174-4450-b306-5a3c2c0e2c0e',
      name: 'BARISAL',
      alias: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    'a5b61fc5-f0c9-4f54-a934-eba18f9110c2': {
      id: 'a5b61fc5-f0c9-4f54-a934-eba18f9110c2',
      name: 'BHOLA',
      alias: 'ভোলা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    '5ffa5780-5ddf-4549-a391-7ad3ba2334d4': {
      id: '5ffa5780-5ddf-4549-a391-7ad3ba2334d4',
      name: 'JHALOKATI',
      alias: 'ঝালকাঠি',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    'c8dcf1fe-bf92-404b-81c0-31d6802a1a68': {
      id: 'c8dcf1fe-bf92-404b-81c0-31d6802a1a68',
      name: 'PATUAKHALI',
      alias: 'পটুয়াখালী ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    '9c86160a-f704-464a-8b7d-9eae2b4cf1f9': {
      id: '9c86160a-f704-464a-8b7d-9eae2b4cf1f9',
      name: 'PIROJPUR',
      alias: 'পিরোজপুর ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    '1846f07e-6f5c-4507-b5d6-126716b0856b': {
      id: '1846f07e-6f5c-4507-b5d6-126716b0856b',
      name: 'BANDARBAN',
      alias: 'বান্দরবান',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    'cf141982-36a1-4308-9090-0445c311f5ae': {
      id: 'cf141982-36a1-4308-9090-0445c311f5ae',
      name: 'BRAHMANBARIA',
      alias: 'ব্রাহ্মণবাড়িয়া',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    '478f518e-8d86-439d-8618-5cfa8d3bf5dd': {
      id: '478f518e-8d86-439d-8618-5cfa8d3bf5dd',
      name: 'CHANDPUR',
      alias: 'চাঁদপুর',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    'db5faba3-8143-4924-a44a-8562ed5e0437': {
      id: 'db5faba3-8143-4924-a44a-8562ed5e0437',
      name: 'CHITTAGONG',
      alias: 'চট্টগ্রাম',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    '5926982b-845c-4463-80aa-cbfb86762e0a': {
      id: '5926982b-845c-4463-80aa-cbfb86762e0a',
      name: 'COMILLA',
      alias: 'কুমিল্লা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    'a3455e64-164c-4bf4-b834-16640a85efd8': {
      id: 'a3455e64-164c-4bf4-b834-16640a85efd8',
      name: "COX'S BAZAR",
      alias: 'কক্সবাজার ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    '1dfc716a-c5f7-4d39-ad71-71d2a359210c': {
      id: '1dfc716a-c5f7-4d39-ad71-71d2a359210c',
      name: 'FENI',
      alias: 'ফেনী',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    }
  },
  languages: JSON.parse(
    readFileSync(
      '../resources/src/bgd/features/languages/generated/register.json'
    ).toString()
  ).data,
  assets: {
    logo: `data:image;base64,${validImageB64String}`
  }
}

export async function createTestStore() {
  const { store, history } = createStore()
  await store.dispatch(
    offlineDataReady({
      languages: mockOfflineData.languages,
      forms: mockOfflineData.forms,
      locations: mockOfflineData.locations,
      facilities: mockOfflineData.facilities,
      assets: mockOfflineData.assets
    })
  )
  return { store, history }
}

export async function createTestComponent(
  node: React.ReactElement<ITestView>,
  store: AppStore,
  graphqlMocks: any = null
) {
  /*
   * Would it work to replace this fn with createTestApp()
   * call send return only the component that requires testing..
   *
   * Feels odd the whole boilerplate has to be recreated
   */

  await store.dispatch(
    offlineDataReady({
      languages: mockOfflineData.languages,
      forms: mockOfflineData.forms,
      locations: mockOfflineData.locations,
      facilities: mockOfflineData.facilities,
      assets: mockOfflineData.assets
    })
  )

  const component = mount(
    <MockedProvider mocks={graphqlMocks} addTypename={false}>
      <Provider store={store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme(getDefaultLanguage())}>
            {node}
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    </MockedProvider>
  )

  return { component: component.update(), store }
}

export const mockDeathApplicationDataWithoutFirstNames = {
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
    permanentAddress: '',
    countryPermanent: 'BGD',
    statePermanent: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    districtPermanent: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4Permanent: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3Permanent: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2Permanent: '193 Kalibari Road',
    addressLine1Permanent: '193 Kalibari Road',
    postCodePermanent: '2200',
    currentAddress: '',
    currentAddressSameAsPermanent: true,
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
    applicantIdType: 'NATIONAL_ID',
    iDType: 'NATIONAL_ID',
    applicantID: '1230000000000',
    applicantFirstNames: '',
    applicantFamilyName: 'ইসলাম',
    applicantFirstNamesEng: 'Islam',
    applicantFamilyNameEng: 'Islam',
    nationality: 'BGD',
    applicantBirthDate: '',
    applicantsRelationToDeceased: 'MOTHER',
    applicantPhone: '01622688231',
    currentAddress: '',
    country: 'BGD',
    state: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    district: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2: '',
    addressLine1: '193 Kalibari Road',
    postCode: '2200',
    permanentAddress: '',
    applicantPermanentAddressSameAsCurrent: true,
    countryPermanent: 'BGD',
    statePermanent: '',
    districtPermanent: '',
    addressLine4Permanent: '',
    addressLine3Permanent: '',
    addressLine2Permanent: '',
    addressLine1Permanent: '',
    postCodePermanent: ''
  },
  deathEvent: {
    deathDate: '1987-02-16',
    manner: 'ACCIDENT',
    deathPlace: '',
    deathPlaceAddress: 'OTHER',
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
    component
      .find('#next_section')
      .hostNodes()
      .simulate('click')

    await flushPromises()
  }
}

export async function goToEndOfForm(component: ReactWrapper) {
  await goToSection(component, 4)
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
  component
    .find('#createPinBtn')
    .hostNodes()
    .simulate('click')

  for (let i = 1; i <= 8; i++) {
    component
      .find(`#keypad-${i % 2}`)
      .hostNodes()
      .simulate('click')
  }
  await flushPromises()
  component.update()
}
