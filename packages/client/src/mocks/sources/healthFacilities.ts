const healthFacilities = {
  resourceType: 'Bundle',
  id: 'a5b81f53-ff27-404a-a13a-c2e0db71aeec',
  meta: {
    lastUpdated: '2023-10-15T12:20:25.399+00:00'
  },
  type: 'searchset',
  total: 8,
  link: [
    {
      relation: 'self',
      url: 'http://gateway.farajaland-staging.opencrvs.org/location?type=HEALTH_FACILITY&_count=0'
    },
    {
      relation: 'next',
      url: 'http://gateway.farajaland-staging.opencrvs.org/location?type=HEALTH_FACILITY&_count=0&_getpagesoffset=0'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/eeb97415-535e-47a5-b85f-7abe46861428/_history/77e25a13-feff-4bc0-af25-c7a1fde1796c',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_pXhz0PLiYZX'
          }
        ],
        name: 'Chamakubi Health Post',
        alias: ['Chamakubi Health Post'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/fb8e19a3-a191-404c-a6ad-58e7963c1d57'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:04.123+00:00',
          versionId: '77e25a13-feff-4bc0-af25-c7a1fde1796c'
        },
        id: 'eeb97415-535e-47a5-b85f-7abe46861428'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/901b0c95-8799-430b-838d-64d4c30b1425/_history/8472de23-817f-431b-87ff-c34e840790aa',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_pgh8kxpUHJU'
          }
        ],
        name: 'Chanyanya Rural Health Centre',
        alias: ['Chanyanya Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/8f12a4bb-b37b-443b-93dc-3182228042fb'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:05.014+00:00',
          versionId: '8472de23-817f-431b-87ff-c34e840790aa'
        },
        id: '901b0c95-8799-430b-838d-64d4c30b1425'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/e8747a35-bdf0-4d47-b106-71d53b087403/_history/13154d2c-27e1-412d-910c-47b734c49b20',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_oABTNoRnphB'
          }
        ],
        name: 'Chibende Health Post',
        alias: ['Chibende Health Post'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/dfd1794f-f5ff-4c33-a3e9-3a2431ed0d43'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:04.718+00:00',
          versionId: '13154d2c-27e1-412d-910c-47b734c49b20'
        },
        id: 'e8747a35-bdf0-4d47-b106-71d53b087403'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/30775a09-aff0-4424-b079-88c361f13cd9/_history/6c89d68c-6e9d-4c21-b326-12d2e4c5418f',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_u0Kxxp8uuwQ'
          }
        ],
        name: 'Banamwaze Rural Health Centre',
        alias: ['Banamwaze Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/eab2b33a-861c-4f3a-be9b-9d95b0e5268b'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:04.513+00:00',
          versionId: '6c89d68c-6e9d-4c21-b326-12d2e4c5418f'
        },
        id: '30775a09-aff0-4424-b079-88c361f13cd9'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/dcef560e-eb02-4b96-a8b8-0d1b5fadff7c/_history/23cc25b7-2ffd-4565-9805-1f699e39b321',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_NtzuCllVXfG'
          }
        ],
        name: 'Bombwe Health Post',
        alias: ['Bombwe Health Post'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/eccc3649-de15-4a05-97cf-5e93ed76d5bd'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:04.337+00:00',
          versionId: '23cc25b7-2ffd-4565-9805-1f699e39b321'
        },
        id: 'dcef560e-eb02-4b96-a8b8-0d1b5fadff7c'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/de1ae111-5d5d-4414-bc1e-84dfb5b40996/_history/c4383f56-5101-42f8-b23c-2ff5f7b81d46',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'HEALTH_FACILITY_xZhQm57zS74'
          }
        ],
        name: 'Chalilo Rural Health Centre',
        alias: ['Chalilo Rural Health Centre'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/a75bc569-5180-405f-b5eb-035928ca1ce8'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:04.451+00:00',
          versionId: 'c4383f56-5101-42f8-b23c-2ff5f7b81d46'
        },
        id: 'de1ae111-5d5d-4414-bc1e-84dfb5b40996'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/b810aca2-8d28-4fb2-9c1e-b907fcd252d0/_history/1badaa49-b66e-4a8e-930b-ee3cdb96584a',
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
          reference: 'Location/fb8e19a3-a191-404c-a6ad-58e7963c1d57'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:04.129+00:00',
          versionId: '1badaa49-b66e-4a8e-930b-ee3cdb96584a'
        },
        id: 'b810aca2-8d28-4fb2-9c1e-b907fcd252d0'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/c72edcc9-840e-41a4-902d-dcb4a60e7faf/_history/31dc4d96-2f81-44af-8bc3-4d99b6722d88',
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
          reference: 'Location/fb8e19a3-a191-404c-a6ad-58e7963c1d57'
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
        meta: {
          lastUpdated: '2023-09-19T11:22:04.137+00:00',
          versionId: '31dc4d96-2f81-44af-8bc3-4d99b6722d88'
        },
        id: 'c72edcc9-840e-41a4-902d-dcb4a60e7faf'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    }
  ]
}

export default healthFacilities
