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
import { referenceApi } from '@client/utils/referenceApi'
import * as fetchMock from 'jest-fetch-mock'

jest.unmock('@client/utils/referenceApi')

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

export const mockFetchLocations = {
  data: {
    'ba819b89-57ec-4d8b-8b91-e8865579a40f': {
      id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
      name: 'Barisal',
      alias: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    }
  }
}

export const mockFetchFacilities = {
  data: [
    {
      id: '3fadd4e1-bcfd-470b-a997-07bc09631e2c',
      name: 'Moktarpur Union Parishad',
      alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      type: 'CRVS_OFFICE',
      partOf: 'Location/9ce9fdba-ae24-467f-87ab-5b5498a0217f'
    }
  ]
}

export const mockFetchPilotLocations = {
  data: {
    'bfe8306c-0910-48fe-8bf5-0db906cf3155': {
      alias: 'বানিয়াজান',
      id: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
      jurisdictionType: 'UNION',
      name: 'Baniajan',
      partOf: 'Location/8f1aae72-2f90-4585-b853-e8c37f4be764',
      physicalType: 'Jurisdiction',
      type: 'ADMIN_STRUCTURE'
    }
  }
}

export const mockCertificatesTemplatesDefinitionData = {
  birth: {
    svgCode: '<svg></svg>'
  },
  death: {
    svgCode: '<svg></svg/>'
  }
}

export const mockFetchCertificatesTemplatesDefinition = [
  {
    event: 'birth',
    status: 'ACTIVE',
    svgCode: '<svg></svg>',
    svgDateCreated: 1640696680593,
    svgDateUpdated: 1644326332088,
    svgFilename: 'oCRVS_DefaultZambia_Death_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  },
  {
    event: 'death',
    status: 'ACTIVE',
    svgCode: '<svg></svg>',
    svgDateCreated: 1640696804785,
    svgDateUpdated: 1643885502999,
    svgFilename: 'oCRVS_DefaultZambia_Birth_v1.svg',
    user: '61d42359f1a2c25ea01beb4b'
  }
]

export const mockCertificateTemplate = {
  data: {
    getActiveCertificatesSVG: [
      {
        event: 'birth',
        status: 'ACTIVE',
        svgCode: '<svg><svg/>',
        svgDateCreated: '1640696680593',
        svgDateUpdated: '1643292458812',
        svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
        user: 'jonathan.campbell',
        __typename: 'CertificateSVG',
        id: '61cb0b68ab0cc2e187089786'
      },
      {
        event: 'death',
        status: 'ACTIVE',
        svgCode: '<svg><svg/>',
        svgDateCreated: '1640696804785',
        svgDateUpdated: '1643292520393',
        svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Death_v1.svg',
        user: 'jonathan.campbell',
        __typename: 'CertificateSVG',
        id: '61cb0be4ab0cc2e187089787'
      }
    ]
  }
}

export const mockFetchConfig = {
  config: {
    API_GATEWAY_URL: 'http://localhost:7070/',
    CONFIG_API_URL: 'http://localhost:2021',
    LOGIN_URL: 'http://localhost:3020',
    AUTH_URL: 'http://localhost:4040',
    RESOURCES_URL: 'http://localhost:3040',
    APPLICATION_NAME: 'Farajaland CRVS',
    UI_POLLING_INTERVAL: 5000,
    FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
    DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
    INFORMANT_MINIMUM_AGE: 16,
    HIDE_EVENT_REGISTER_INFORMATION: false,
    EXTERNAL_VALIDATION_WORKQUEUE: false,
    PHONE_NUMBER_PATTERN: '/^0(7|9)[0-9]{1}[0-9]{7}$/',
    SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
    LOGROCKET: 'opencrvs-foundation/opencrvs-zambia',
    NID_NUMBER_PATTERN: '/^[0-9]{9}$/',
    COUNTRY: 'zmb',
    CURRENCY: {
      isoCode: 'ZMW',
      languagesAndCountry: ['en-ZM']
    },
    LANGUAGES: 'en',
    ADDRESSES: 1
  },
  certificates: [
    {
      _id: '620bdfb896974e7de5a91624',
      svgCode: '<svg></svg>',
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
      user: 'jonathan.campbell',
      event: 'birth',
      status: 'ACTIVE',
      svgDateUpdated: 1643292458812,
      svgDateCreated: 1640696680593
    },
    {
      _id: '620bdfb896974e7de5a91625',
      svgCode: '<svg></svg>',
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Death_v1.svg',
      user: 'jonathan.campbell',
      event: 'death',
      status: 'ACTIVE',
      svgDateUpdated: 1643292520393,
      svgDateCreated: 1640696804785
    }
  ],
  formConfig: { questionConfig: [] }
}

const certificates = [
  {
    id: '620bdfb896974e7de5a91624',
    svgCode: '<svg></svg>',
    svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
    user: 'jonathan.campbell',
    event: 'birth',
    status: 'ACTIVE',
    svgDateUpdated: 1643292458812,
    svgDateCreated: 1640696680593
  },
  {
    id: '620bdfb896974e7de5a91625',
    svgCode: '<svg></svg>',
    svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Death_v1.svg',
    user: 'jonathan.campbell',
    event: 'death',
    status: 'ACTIVE',
    svgDateUpdated: 1643292520393,
    svgDateCreated: 1640696804785
  }
]

describe('referenceApi', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('retrieves the locations from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchLocations))

    const data = await referenceApi.loadLocations()
    expect(data).toEqual(mockFetchLocations.data)
  })

  it('retrieves the facilities from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchFacilities))

    const data = await referenceApi.loadFacilities()
    expect(data).toEqual(mockFetchFacilities.data)
  })

  it('retrieves the pilot location list from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchPilotLocations))

    const data = await referenceApi.loadPilotLocations()
    expect(data).toEqual(mockFetchPilotLocations.data)
  })

  it('retrieves the config from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchConfig))
    const data = await referenceApi.loadConfig()
    expect(data).toEqual({
      ...mockFetchConfig,
      certificates
    })
  })
})
