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
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable
} from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { App, routesConfig } from '@client/App'
import { offlineDataReady } from '@client/offline/actions'
import { AppStore, createStore, IStoreState } from '@client/store'
import { getSchema } from '@client/tests/graphql-schema-mock'
import { EventType, FetchUserQuery, Status } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { I18nContainer } from '@opencrvs/client/src/i18n/components/I18nContainer'
import {
  DEFAULT_ROLES_DEFINITION,
  Scope,
  SCOPES,
  TestUserRole,
  TokenUserType,
  UUID
} from '@opencrvs/commons/client'
import { getTheme } from '@opencrvs/components/lib/theme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import {
  configure,
  mount,
  MountRendererProps,
  ReactWrapper,
  shallow
} from 'enzyme'
import { readFileSync } from 'fs'
import { graphql, print } from 'graphql'
import * as jwt from 'jsonwebtoken'
import { join } from 'path'
import * as React from 'react'
import { IntlShape } from 'react-intl'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { waitForElement } from './wait-for-element'

import { SUBMISSION_STATUS } from '@client/declarations'
import { SubmissionAction } from '@client/forms'
import * as actions from '@client/profile/profileActions'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { mockOfflineData, validImageB64String } from './mock-offline-data'

export const validToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

export const SYSTEM_ADMIN_DEFAULT_SCOPES = [
  SCOPES.CONFIG_UPDATE_ALL,
  SCOPES.USER_CREATE,
  SCOPES.USER_READ,
  SCOPES.USER_UPDATE,
  SCOPES.ORGANISATION_READ_LOCATIONS,
  SCOPES.PERFORMANCE_READ,
  SCOPES.PERFORMANCE_READ_DASHBOARDS,
  SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
] satisfies Scope[]

export const REGISTRAR_DEFAULT_SCOPES = [
  SCOPES.RECORD_DECLARE_BIRTH,
  SCOPES.RECORD_DECLARE_DEATH,
  SCOPES.RECORD_DECLARE_MARRIAGE,
  SCOPES.RECORD_SUBMIT_FOR_UPDATES,
  SCOPES.RECORD_REVIEW_DUPLICATES,
  SCOPES.RECORD_DECLARATION_ARCHIVE,
  SCOPES.RECORD_DECLARATION_REINSTATE,
  SCOPES.RECORD_REGISTER,
  SCOPES.RECORD_REGISTRATION_CORRECT,
  SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
  SCOPES.PERFORMANCE_READ,
  SCOPES.PERFORMANCE_READ_DASHBOARDS,
  SCOPES.ORGANISATION_READ_LOCATIONS,
  SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
  SCOPES.SEARCH_BIRTH,
  SCOPES.SEARCH_DEATH,
  SCOPES.SEARCH_MARRIAGE
] satisfies Scope[]

const ACTION_STATUS_MAP = {
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

function waitForReady(app: ReactWrapper) {
  return waitForElement(app, '#readyDeclaration')
}

export async function createTestApp(
  config = { waitUntilOfflineCountryConfigLoaded: true },
  initialEntries?: string[]
) {
  const { store } = await createTestStore()
  const router = createMemoryRouter(routesConfig, { initialEntries })

  const app = mount(
    <App store={store} router={router} client={createGraphQLClient()} />
  )

  if (config.waitUntilOfflineCountryConfigLoaded) {
    await waitForReady(app)
  }
  return { app, store, router }
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
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  wrapper: ReactWrapper<{}, {}, React.Component<{}, {}, any>>,
  selector: string,
  option: string
): ReactWrapper => {
  const input = wrapper.find(selector).hostNodes()

  input.find('input').simulate('focus').update()
  input.find('.react-select__control').first().simulate('mousedown').update()

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

  nodes.first().simulate('click').update()

  return input.find('.react-select__control').first()
}

const eventAddressData = {
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

const primaryAddressData = {
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

const secondaryAddressData = {
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

const primaryInternationalAddressLines = {
  internationalStatePrimary: 'ujggiu',
  internationalDistrictPrimary: 'iuoug',
  internationalCityPrimary: '',
  internationalAddressLine1Primary: '',
  internationalAddressLine2Primary: '',
  internationalAddressLine3Primary: '',
  internationalPostalCodePrimary: ''
}

const secondaryInternationalAddressLines = {
  internationalStateSecondary: 'ugou',
  internationalDistrictSecondary: 'iugoug',
  internationalCitySecondary: '',
  internationalAddressLine1Secondary: '',
  internationalAddressLine2Secondary: '',
  internationalAddressLine3Secondary: '',
  internationalPostalCodeSecondary: ''
}

export const userDetails: UserDetails = {
  id: 'b77b78af-a259-4bc1-85d5-b1e8c1382273',
  type: 'user',
  status: 'active',
  name: [
    {
      use: 'en',
      given: ['Shakib'],
      family: 'Al Hasan'
    },
    { use: 'bn', given: [''], family: '' }
  ],
  role: TestUserRole.enum.FIELD_AGENT,
  mobile: '01677701431',
  primaryOfficeId: '6327dbd9-e118-4dbe-9246-cb0f7649a666' as UUID
}

export const mockUserResponse = {
  data: {
    getUser: {
      userMgntUserID: '123',
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
      role: {
        label: {
          id: 'userRoles.localRegistar',
          defaultMessage: 'Local Registrar',
          description: 'Label for local registrar'
        }
      },
      practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
    }
  }
}

const mockLocalSysAdminUserResponse = {
  data: {
    getUser: {
      userMgntUserID: '123',
      primaryOffice: {
        id: '0d8474da-0361-4d32-979e-af91f012340a',
        name: 'Kaliganj Union Sub Center',
        status: 'active',
        __typename: 'Location'
      },
      role: {
        label: {
          id: 'userRoles.localSystemAdmin',
          defaultMessage: 'Local System Admin',
          description: 'Label for local system admin'
        }
      },
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
      primaryOffice: {
        id: '2a83cf14-b959-47f4-8097-f75a75d1867f',
        name: 'Kaliganj Union Sub Center',
        status: 'active',
        __typename: 'Location'
      },
      label: {
        defaultMessage: 'Local Registrar',
        description: 'Name for user role Local Registrar',
        id: 'userRole.localRegistrar'
      },
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

function appendStringToKeys(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  obj: Record<string, any>,
  appendString: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): Record<string, any> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const newObj: Record<string, any> = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key + appendString] = obj[key]
    }
  }

  return newObj
}

const mockDeclarationData = {
  template: {},
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
    certificates: [{ certificateTemplateId: 'birth-certificate' }]
  },
  documents: {}
}

const mockDeathDeclarationData = {
  template: {},
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
    informantID: '123456789',
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
        hasShowedVerifiedDocument: true,
        certificateTemplateId: 'death-certificate'
      }
    ]
  }
}

const mockMarriageDeclarationData = {
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
        hasShowedVerifiedDocument: true,
        certificateTemplateId: 'marriage-certificate'
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

const mockBirthRegistrationSectionData = {
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
      certificateTemplateId: 'birth-certificate',
      hasShowedVerifiedDocument: true
    }
  ]
}

const mockDeathRegistrationSectionData = {
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
      hasShowedVerifiedDocument: true,
      certificateTemplateId: 'death-certificate'
    }
  ]
}

const mockFetchCertificatesTemplatesDefinition = [
  {
    id: 'birth-certificate',
    event: 'birth' as EventType,
    label: {
      id: 'certificates.birth.certificate',
      defaultMessage: 'Birth Certificate',
      description: 'The label for a birth certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: true,
    svgUrl: '/api/countryconfig/certificates/birth-certificate.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
  },
  {
    id: 'birth-certificate-copy',
    event: 'birth' as EventType,
    label: {
      id: 'certificates.birth-certificate-copy',
      defaultMessage: 'Birth Certificate certified copy',
      description: 'The label for a birth certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: false,
    svgUrl: '/api/countryconfig/certificates/birth-certificate-copy.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
  },
  {
    id: 'death-certificate',
    event: 'death' as EventType,
    label: {
      id: 'certificates.death.certificate',
      defaultMessage: 'Death Certificate',
      description: 'The label for a death certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: true,
    svgUrl: '/api/countryconfig/certificates/death-certificate.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
  },
  {
    id: 'marriage-certificate',
    event: 'marriage' as EventType,
    label: {
      id: 'certificates.marriage.certificate',
      defaultMessage: 'Marriage Certificate',
      description: 'The label for a marriage certificate'
    },
    fee: {
      onTime: 0,
      late: 5.5,
      delayed: 15
    },
    isDefault: true,
    svgUrl: '/api/countryconfig/certificates/marriage-certificate.svg',
    svg: '<svg></svg>',
    fonts: {
      'Noto Sans': {
        normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
        italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
        bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
      }
    }
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
  activeFacilities: mockOfflineData.facilities,
  offices: mockOfflineData.offices,
  activeOffices: mockOfflineData.offices,
  assets: mockOfflineData.assets,
  config: mockOfflineData.config,
  anonymousConfig: mockOfflineData.anonymousConfig,
  forms: JSON.parse(readFileSync(join(__dirname, './forms.json')).toString())
    .forms,
  systems: mockOfflineData.systems
}

export async function createTestStore() {
  const { store } = createStore()
  store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  await flushPromises()
  return { store }
}

export async function createTestComponent(
  node: React.ReactElement<ITestView>,
  {
    store,
    graphqlMocks,
    apolloClient,
    initialEntries,
    path = '*'
  }: {
    store: AppStore
    graphqlMocks?: MockedProvider['props']['mocks']
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    apolloClient?: ApolloClient<any>
    initialEntries?:
      | string[]
      | {
          pathname: string
          state: Record<
            string,
            | string
            | boolean
            | number
            | Record<string, string | boolean | number>
          >
        }[]
    path?: string
  },
  options?: MountRendererProps
) {
  store.dispatch(offlineDataReady(mockOfflineDataDispatch))
  await flushPromises()

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
  const router = createMemoryRouter(
    [
      {
        path,
        element: node
      }
    ],
    { initialEntries }
  )

  function PropProxy() {
    return withGraphQL(
      <Provider store={store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme()}>
            <RouterProvider router={router} />
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    )
  }

  return { component: mount(<PropProxy />, options), router }
}

export const mockRoles = {
  data: {
    getUserRoles: DEFAULT_ROLES_DEFINITION
  }
}

export {
  mockOfflineData,
  mockOfflineLocationsWithHierarchy
} from './mock-offline-data'

export function fetchUserMock(officeId: string): FetchUserQuery {
  return {
    getUser: {
      id: '123',
      userMgntUserID: '123',
      primaryOffice: {
        id: officeId
      },
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful'
        }
      ],
      status: Status.Active,
      practitionerId: '4651d1cc-6072-4e34-bf20-b583f421a9f1',
      creationDate: '1701241360173',
      role: {
        id: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
        label: {
          id: 'userRoles.localSystemAdmin',
          defaultMessage: 'Local System Admin',
          description: 'Label for local system admin'
        }
      }
    }
  }
}

export function generateToken({
  scope,
  userType,
  role,
  subject
}: {
  scope: Scope[]
  subject?: string
  userType?: TokenUserType
  role?: TestUserRole
}) {
  if (subject) {
    return jwt.sign(
      { scope, userType, role },
      readFileSync('./test/cert.key'),
      {
        subject,
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
  }

  return jwt.sign({ scope }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:gateway-user'
  })
}

export function setScopes(scope: Scope[], store: AppStore) {
  const token = generateToken({ scope })

  window.history.replaceState({}, '', '?token=' + token)

  return store.dispatch({
    type: actions.CHECK_AUTH
  })
}
