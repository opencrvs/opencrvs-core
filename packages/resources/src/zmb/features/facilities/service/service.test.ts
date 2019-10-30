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
import { getFacilities } from '@resources/zmb/features/facilities/service/service'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

const crvsOfficeBundle = JSON.stringify({
  resourceType: 'Bundle',
  id: '43801bd0-1f9b-4cc7-9eaa-624ead896de8',
  meta: {
    lastUpdated: '2019-02-20T07:25:58.317+00:00'
  },
  type: 'searchset',
  total: 24,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Location?type=CRVS_OFFICE&_count=2'
    },
    {
      relation: 'next',
      url:
        'http://localhost:3447/fhir/Location?type=CRVS_OFFICE&_count=2&_getpagesoffset=2'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/2917f245-d25e-4789-8de2-22b2d8498764/_history/e607e188-a773-425e-b34a-1cdf00e3fd69',
      resource: {
        resourceType: 'Location',
        identifier: [],
        name: 'Moktarpur Union Parishad',
        alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/7a18cb4c-38f3-449f-b3dc-508473d485f3'
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
        telecom: [
          {
            system: 'phone',
            value: ''
          },
          {
            system: 'email',
            value: ''
          }
        ],
        address: {
          line: ['Moktarpur', 'Kaliganj'],
          district: 'Gazipur',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-01-30T12:26:12.293+00:00',
          versionId: 'e607e188-a773-425e-b34a-1cdf00e3fd69'
        },
        id: '2917f245-d25e-4789-8de2-22b2d8498764'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/30763019-ced1-4932-80d9-fa94ccda729a/_history/29d46612-1f58-44db-a1cf-31ec9a2a75e4',
      resource: {
        resourceType: 'Location',
        identifier: [],
        name: 'Nagari Union Parishad',
        alias: ['নাগারি ইউনিয়ন পরিষদ'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0d253962-9a7d-4200-b138-aec2c3dc8569'
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
        telecom: [
          {
            system: 'phone',
            value: ''
          },
          {
            system: 'email',
            value: ''
          }
        ],
        address: {
          line: ['Nagari', 'Kaliganj'],
          district: 'Gazipur',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-01-30T12:26:12.301+00:00',
          versionId: '29d46612-1f58-44db-a1cf-31ec9a2a75e4'
        },
        id: '30763019-ced1-4932-80d9-fa94ccda729a'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    }
  ]
})

const healthFacilityBundle = JSON.stringify({
  resourceType: 'Bundle',
  id: '695abae9-c17d-445f-95b6-790bf82966b0',
  meta: {
    lastUpdated: '2019-02-20T07:19:26.375+00:00'
  },
  type: 'searchset',
  total: 193,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Location?type=HEALTH_FACILITY&_count=2'
    },
    {
      relation: 'next',
      url:
        'http://localhost:3447/fhir/Location?type=HEALTH_FACILITY&_count=2&_getpagesoffset=2'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/e96b7828-4b22-43bf-aee9-8959949893a2/_history/bfac445f-a25e-44e1-8aa3-b8ef24365675',
      resource: {
        resourceType: 'Location',
        identifier: [],
        name: 'Shaheed Taj Uddin Ahmad Medical College',
        alias: ['শহীদ তাজউদ্দিন আহমেদ মেডিকেল কলেজ হাসপাতাল'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/cc4353ce-ec0e-4f3e-81b4-224061385154'
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
        telecom: [
          {
            system: 'phone',
            value: '01711220636'
          },
          {
            system: 'email',
            value: 'ggazipurmc@ac.dghs.gov.bd'
          }
        ],
        address: {
          line: ['', 'Gazipur Sadar'],
          district: 'Gazipur',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-01-30T12:26:12.380+00:00',
          versionId: 'bfac445f-a25e-44e1-8aa3-b8ef24365675'
        },
        id: 'e96b7828-4b22-43bf-aee9-8959949893a2'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/37a715b8-5e6a-4f1a-8308-72ef8348ad54/_history/a7a3e9b3-3211-48ae-b46e-a2c927c52072',
      resource: {
        resourceType: 'Location',
        identifier: [],
        name: 'Kaliganj Union Sub Center',
        alias: ['কালীগঞ্জ ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/3b0680cb-ef9b-4c46-bc8b-bbfdcaa49162'
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
        telecom: [
          {
            system: 'phone',
            value: '01833280000'
          },
          {
            system: 'email',
            value: 'kaliganj_singra@usc.dghs.gov.bd'
          }
        ],
        address: {
          line: ['', 'Kaliganj'],
          district: 'Gazipur',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-01-30T12:26:12.383+00:00',
          versionId: 'a7a3e9b3-3211-48ae-b46e-a2c927c52072'
        },
        id: '37a715b8-5e6a-4f1a-8308-72ef8348ad54'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    }
  ]
})

describe('facilities service', () => {
  describe('getFacilities()', () => {
    it('returns facilities in a simplified format', async () => {
      fetch.once(crvsOfficeBundle)
      fetch.once(healthFacilityBundle)
      const facilities = await getFacilities()
      expect(facilities.data).toBeDefined()
      expect(facilities.data).toEqual({
        '2917f245-d25e-4789-8de2-22b2d8498764': {
          id: '2917f245-d25e-4789-8de2-22b2d8498764',
          name: 'Moktarpur Union Parishad',
          alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
          physicalType: 'Building',
          type: 'CRVS_OFFICE',
          partOf: 'Location/7a18cb4c-38f3-449f-b3dc-508473d485f3'
        },
        '30763019-ced1-4932-80d9-fa94ccda729a': {
          id: '30763019-ced1-4932-80d9-fa94ccda729a',
          name: 'Nagari Union Parishad',
          alias: 'নাগারি ইউনিয়ন পরিষদ',
          physicalType: 'Building',
          type: 'CRVS_OFFICE',
          partOf: 'Location/0d253962-9a7d-4200-b138-aec2c3dc8569'
        },
        'e96b7828-4b22-43bf-aee9-8959949893a2': {
          id: 'e96b7828-4b22-43bf-aee9-8959949893a2',
          name: 'Shaheed Taj Uddin Ahmad Medical College',
          alias: 'শহীদ তাজউদ্দিন আহমেদ মেডিকেল কলেজ হাসপাতাল',
          physicalType: 'Building',
          type: 'HEALTH_FACILITY',
          partOf: 'Location/cc4353ce-ec0e-4f3e-81b4-224061385154'
        },
        '37a715b8-5e6a-4f1a-8308-72ef8348ad54': {
          id: '37a715b8-5e6a-4f1a-8308-72ef8348ad54',
          name: 'Kaliganj Union Sub Center',
          alias: 'কালীগঞ্জ ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র',
          physicalType: 'Building',
          type: 'HEALTH_FACILITY',
          partOf: 'Location/3b0680cb-ef9b-4c46-bc8b-bbfdcaa49162'
        }
      })
    })

    it('throw an error when the fetch fails', async () => {
      fetch.mockRejectOnce(new Error('boom'))
      expect(getFacilities()).rejects.toThrowError('boom')
    })
  })
})
