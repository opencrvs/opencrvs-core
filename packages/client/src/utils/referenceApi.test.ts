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
import { referenceApi } from '@client/utils/referenceApi'
import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

vi.unmock('@client/utils/referenceApi')

const fetch = createFetchMock(vi)
fetch.enableMocks()

const mockFetchLocations = {
  resourceType: 'Bundle',
  id: 'ed2915f5-7257-4ae6-8499-4121a42c1a88',
  meta: {
    lastUpdated: '2022-11-23T16:27:12.436+00:00'
  },
  type: 'searchset',
  total: 20,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:7070/location?type=ADMIN_STRUCTURE&_count=0&status=active'
    },
    {
      relation: 'next',
      url: 'http://localhost:7070/location?type=ADMIN_STRUCTURE&_count=0&status=active&_getpagesoffset=0'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:7070/location/7dbf10a9-23d9-4038-8b1c-9f6547ab4877/_history/39d24680-f610-45bd-8d74-2becd7defea2',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_AWn3s2RqgAN'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Central',
        alias: ['Central'],
        description: 'AWn3s2RqgAN',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":214275},{"2008":207428},{"2009":225250},{"2010":218551},{"2011":222568},{"2012":224450},{"2013":162537},{"2014":140674},{"2015":321276},{"2016":329269},{"2017":315012},{"2018":329397},{"2019":372808},{"2020":372995},{"2021":387162}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":200754},{"2008":196169},{"2009":212379},{"2010":207788},{"2011":210183},{"2012":211088},{"2013":155454},{"2014":138895},{"2015":321542},{"2016":328719},{"2017":311254},{"2018":320242},{"2019":308227},{"2020":329978},{"2021":299071}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":414977},{"2008":403572},{"2009":437579},{"2010":426327},{"2011":432706},{"2012":435471},{"2013":317995},{"2014":279569},{"2015":642817},{"2016":657989},{"2017":626267},{"2018":649640},{"2019":681033},{"2020":702973},{"2021":686234}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":9.925},{"2008":10.4875},{"2009":9.024999999999999},{"2010":8.75},{"2011":9.7875},{"2012":9.9375},{"2013":9.450000000000001},{"2014":10.100000000000001},{"2015":9.162500000000001},{"2016":8.8},{"2017":8.225},{"2018":7.875},{"2019":7.1625},{"2020":6.8375},{"2021":6.987499999999999}]'
          }
        ],
        meta: {
          lastUpdated: '2022-06-27T12:04:39.175+00:00',
          versionId: '39d24680-f610-45bd-8d74-2becd7defea2'
        },
        id: '7dbf10a9-23d9-4038-8b1c-9f6547ab4877'
      },
      request: {
        method: 'PUT',
        url: 'Location/7dbf10a9-23d9-4038-8b1c-9f6547ab4877'
      }
    },
    {
      fullUrl:
        'http://localhost:7070/location/8fe4b15b-b5d0-4ff7-9f24-ec24f5d33811/_history/5e9b7837-2958-411c-a62a-582c033605f4',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_KozcEjeTyuD'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Sulaka',
        alias: ['Sulaka'],
        description: 'KozcEjeTyuD',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":202026},{"2008":206165},{"2009":210738},{"2010":211440},{"2011":213754},{"2012":217590},{"2013":192838},{"2014":192150},{"2015":199860},{"2016":198532},{"2017":192892},{"2018":185265},{"2019":195612},{"2020":188431},{"2021":192865}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":189094},{"2008":192605},{"2009":197047},{"2010":198450},{"2011":201277},{"2012":205572},{"2013":187141},{"2014":187670},{"2015":198604},{"2016":196495},{"2017":191918},{"2018":200588},{"2019":200633},{"2020":218160},{"2021":221794}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":391065},{"2008":398704},{"2009":407703},{"2010":409822},{"2011":414971},{"2012":423118},{"2013":379980},{"2014":379820},{"2015":398463},{"2016":395028},{"2017":384811},{"2018":385854},{"2019":396245},{"2020":406593},{"2021":414659}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":8.85},{"2008":9.525},{"2009":8.9},{"2010":9.45},{"2011":8.5375},{"2012":8.0875},{"2013":8.2125},{"2014":8.1375},{"2015":8.625},{"2016":9.5875},{"2017":9.4},{"2018":8.850000000000001},{"2019":8.65},{"2020":9.0625},{"2021":9.75}]'
          }
        ],
        meta: {
          lastUpdated: '2022-06-27T12:04:39.185+00:00',
          versionId: '5e9b7837-2958-411c-a62a-582c033605f4'
        },
        id: '8fe4b15b-b5d0-4ff7-9f24-ec24f5d33811'
      },
      request: {
        method: 'PUT',
        url: 'Location/8fe4b15b-b5d0-4ff7-9f24-ec24f5d33811'
      }
    }
  ]
}

const parsedLocations = {
  '7dbf10a9-23d9-4038-8b1c-9f6547ab4877': {
    id: '7dbf10a9-23d9-4038-8b1c-9f6547ab4877',
    name: 'Central',
    alias: 'Central',
    status: 'active',
    physicalType: 'Jurisdiction',
    statisticalId: 'AWn3s2RqgAN',
    jurisdictionType: 'STATE',
    type: 'ADMIN_STRUCTURE',
    partOf: 'Location/0'
  },
  '8fe4b15b-b5d0-4ff7-9f24-ec24f5d33811': {
    id: '8fe4b15b-b5d0-4ff7-9f24-ec24f5d33811',
    name: 'Sulaka',
    alias: 'Sulaka',
    status: 'active',
    physicalType: 'Jurisdiction',
    statisticalId: 'KozcEjeTyuD',
    jurisdictionType: 'STATE',
    type: 'ADMIN_STRUCTURE',
    partOf: 'Location/0'
  }
}

const mockFetchOffices = {
  resourceType: 'Bundle',
  id: '2ff926ac-e873-4f8b-b78d-b5a6d6537b07',
  meta: {
    lastUpdated: '2022-11-23T16:32:52.806+00:00'
  },
  type: 'searchset',
  total: 17,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:7070/location?type=CRVS_OFFICE&_count=0&status=active'
    },
    {
      relation: 'next',
      url: 'http://localhost:7070/location?type=CRVS_OFFICE&_count=0&status=active&_getpagesoffset=0'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:7070/location/b3de59a0-835d-4c62-b91b-bc86e312d08e/_history/b052793e-87b7-4bf7-9dd3-119cb2cb62a4',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_2OKicPQMNI'
          }
        ],
        name: 'HQ Office',
        alias: ['HQ Office'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/56eafead-7264-4c22-aa38-3dc75ad061b4'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'CRVS_OFFICE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        telecom: [],
        address: {
          line: [],
          district: 'Itambo District',
          state: 'Central Province'
        },
        meta: {
          lastUpdated: '2022-06-27T12:04:35.538+00:00',
          versionId: 'b052793e-87b7-4bf7-9dd3-119cb2cb62a4'
        },
        id: 'b3de59a0-835d-4c62-b91b-bc86e312d08e'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://localhost:7070/location/964d9765-dc96-4c7e-81ec-0a5572d4ea68/_history/fcb6da4e-b574-48c1-9709-7396fd521b6c',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_OFFICE_JEhYJ82xRI'
          }
        ],
        name: 'Isamba District Office',
        alias: ['Isamba District Office'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/6f0ae45f-eefa-4b9e-9224-159e66bbee26'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'CRVS_OFFICE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        telecom: [],
        address: {
          line: [],
          district: 'Isamba District',
          state: 'Central Province'
        },
        meta: {
          lastUpdated: '2022-06-27T12:04:35.554+00:00',
          versionId: 'fcb6da4e-b574-48c1-9709-7396fd521b6c'
        },
        id: '964d9765-dc96-4c7e-81ec-0a5572d4ea68'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    }
  ]
}

const mockFetchFacilities = {
  resourceType: 'Bundle',
  id: '946900ea-0aa7-487d-9059-2942d2f54743',
  meta: {
    lastUpdated: '2022-11-23T16:18:58.244+00:00'
  },
  type: 'searchset',
  total: 301,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:7070/location?type=HEALTH_FACILITY&_count=0&status=active'
    },
    {
      relation: 'next',
      url: 'http://localhost:7070/location?type=HEALTH_FACILITY&_count=0&status=active&_getpagesoffset=0'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:7070/location/3ab39ce5-6d03-4149-8ae2-9f4f0baeadf8/_history/05149216-4084-434c-97e2-2f0a8f1c65df',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_di3U5u7F8Y3'
          }
        ],
        name: 'Ibombo Rural Health Centre',
        alias: ['Ibombo Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/b09122df-81f8-41a0-b5c6-68cba4145cab'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HEALTH_FACILITY'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        telecom: [],
        address: {
          line: []
        },
        meta: {
          lastUpdated: '2022-06-27T12:04:35.698+00:00',
          versionId: '05149216-4084-434c-97e2-2f0a8f1c65df'
        },
        id: '3ab39ce5-6d03-4149-8ae2-9f4f0baeadf8'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://localhost:7070/location/7599ea22-0df3-4cd9-9d15-8868487deb4d/_history/c541a21c-82cd-42d2-ad1d-060d176e0766',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_B5LpoYehUfI'
          }
        ],
        name: 'Chikobo Rural Health Centre',
        alias: ['Chikobo Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/b09122df-81f8-41a0-b5c6-68cba4145cab'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HEALTH_FACILITY'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        telecom: [],
        address: {
          line: []
        },
        meta: {
          lastUpdated: '2022-06-27T12:04:35.705+00:00',
          versionId: 'c541a21c-82cd-42d2-ad1d-060d176e0766'
        },
        id: '7599ea22-0df3-4cd9-9d15-8868487deb4d'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    }
  ]
}

const parsedFacilities = {
  'b3de59a0-835d-4c62-b91b-bc86e312d08e': {
    id: 'b3de59a0-835d-4c62-b91b-bc86e312d08e',
    name: 'HQ Office',
    alias: 'HQ Office',
    status: 'active',
    physicalType: 'Building',
    jurisdictionType: '',
    type: 'CRVS_OFFICE',
    statisticalId: '',
    partOf: 'Location/56eafead-7264-4c22-aa38-3dc75ad061b4'
  },
  '964d9765-dc96-4c7e-81ec-0a5572d4ea68': {
    id: '964d9765-dc96-4c7e-81ec-0a5572d4ea68',
    name: 'Isamba District Office',
    alias: 'Isamba District Office',
    status: 'active',
    physicalType: 'Building',
    jurisdictionType: '',
    type: 'CRVS_OFFICE',
    statisticalId: '',
    partOf: 'Location/6f0ae45f-eefa-4b9e-9224-159e66bbee26'
  },
  '3ab39ce5-6d03-4149-8ae2-9f4f0baeadf8': {
    id: '3ab39ce5-6d03-4149-8ae2-9f4f0baeadf8',
    name: 'Ibombo Rural Health Centre',
    alias: 'Ibombo Rural Health Centre',
    status: 'active',
    physicalType: 'Building',
    jurisdictionType: '',
    type: 'HEALTH_FACILITY',
    statisticalId: '',
    partOf: 'Location/b09122df-81f8-41a0-b5c6-68cba4145cab'
  },
  '7599ea22-0df3-4cd9-9d15-8868487deb4d': {
    id: '7599ea22-0df3-4cd9-9d15-8868487deb4d',
    name: 'Chikobo Rural Health Centre',
    alias: 'Chikobo Rural Health Centre',
    status: 'active',
    physicalType: 'Building',
    jurisdictionType: '',
    type: 'HEALTH_FACILITY',
    statisticalId: '',
    partOf: 'Location/b09122df-81f8-41a0-b5c6-68cba4145cab'
  }
}

const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

const mockFetchConfig = {
  config: {
    API_GATEWAY_URL: 'http://localhost:7070/',
    CONFIG_API_URL: 'http://localhost:2021',
    LOGIN_URL: 'http://localhost:3020',
    AUTH_URL: 'http://localhost:4040',
    RESOURCES_URL: 'http://localhost:3040',
    APPLICATION_NAME: 'Farajaland CRVS',
    FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
    DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
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
    INTEGRATIONS: [
      {
        name: 'MOSIP',
        status: statuses.ACTIVE
      }
    ]
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
  systems: [
    {
      name: 'MOSIP',
      status: statuses.ACTIVE
    }
  ]
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
    expect(data).toEqual(parsedLocations)
  })

  it('retrieves the facilities from the server', async () => {
    fetch.mockResponses(
      [JSON.stringify(mockFetchOffices), { status: 200 }],
      [JSON.stringify(mockFetchFacilities), { status: 200 }]
    )

    const data = await referenceApi.loadFacilities()
    expect(data).toEqual(parsedFacilities)
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
