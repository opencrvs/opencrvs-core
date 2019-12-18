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

export const mockUnion = {
  resourceType: 'Bundle',
  id: '8e937c84-daed-433e-bc2b-542c6ef6ad1f',
  meta: { lastUpdated: '2019-12-12T13:31:44.463+00:00' },
  total: 1,
  link: [
    {
      relation: 'self',
      url:
        'http://localhost:3447/fhir/Location?name=Mahishasura&identifier=UNION'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/66d11bf6-a43e-4e12-b3a7-d834ef8adaf1/_history/ac0c900c-6506-4e97-b70e-c1069a76fc76',
      resource: {
        resourceType: 'Location',
        identifier: [
          { system: 'http://opencrvs.org/specs/id/geo-id', value: '4151' },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '59' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UNION'
          },
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
            value: 'division=3&district=29&upazila=229&union=4151'
          }
        ],
        name: 'Mahishasura',
        alias: ['মহিষাশুরা'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0f927680-9e83-4fae-b20b-e9980acf68ed'
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
          coding: [{ code: 'jdn', display: 'Jurisdiction' }]
        },
        extension: [
          {
            url:
              'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          }
        ],
        meta: {
          lastUpdated: '2019-12-12T12:18:29.372+00:00',
          versionId: 'ac0c900c-6506-4e97-b70e-c1069a76fc76'
        },
        id: '66d11bf6-a43e-4e12-b3a7-d834ef8adaf1'
      },
      request: { method: 'POST', url: 'Location' }
    }
  ]
}

export const mockUnionFacility = {
  resourceType: 'Bundle',
  id: 'c802dede-e7b6-498f-bae2-75787c843914',
  meta: { lastUpdated: '2019-12-12T13:45:06.112+00:00' },
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Location?identifier=24480'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/1f9e76a0-dcaf-4256-8d61-f01847020c30/_history/28945b65-2fe2-44c7-8978-46f3229044b6',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/hris-internal-id',
            value: '24480'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-uuid',
            value: '24ec514d-d542-401a-9a46-86dc34ce628f'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-code',
            value: '10024892'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-union-name',
            value: 'Mahishasura'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-paurasava-name',
            value: 'Unions Of Narsingdi Sadar Upazila'
          }
        ],
        name: 'Dr. Nuruzzaman Khokon CC - Narsingdi Sadar',
        alias: ['ডা: নুরুজ্জামান খোকন কমিউনিটি ক্লিনিক, নরসিংদী সদর।'],
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/0f927680-9e83-4fae-b20b-e9980acf68ed' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HEALTH_FACILITY'
            }
          ]
        },
        physicalType: { coding: [{ code: 'bu', display: 'Building' }] },
        telecom: [],
        address: {
          line: ['Mahishasura', 'Narsingdi Sadar'],
          district: 'Narsingdi',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-12-12T12:47:25.561+00:00',
          versionId: '28945b65-2fe2-44c7-8978-46f3229044b6'
        },
        id: '1f9e76a0-dcaf-4256-8d61-f01847020c30'
      },
      request: { method: 'POST', url: 'Location' }
    }
  ]
}

export const mockMunicipalityFacility = {
  resourceType: 'Bundle',
  id: '92d7dd81-c7f7-42bf-b856-9201a08729d6',
  meta: { lastUpdated: '2019-12-12T13:35:20.183+00:00' },
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Location?identifier=19884'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/7ec28833-ed70-438f-a757-87dba2cf5447/_history/32329ae1-4320-4982-bede-998b6c1feb6e',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/hris-internal-id',
            value: '19884'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-uuid',
            value: '567bc137-c6f7-42dd-a8c8-1befef0c26e1'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-code',
            value: '10020296'
          },
          { system: 'http://opencrvs.org/specs/id/hris-union-name', value: '' },
          {
            system: 'http://opencrvs.org/specs/id/hris-paurasava-name',
            value: 'Narsingdi Paurashava'
          }
        ],
        name: 'Marie Stops-Narsingdi Sadar',
        alias: ['মেরি স্টোপস-নরসিংদী সদর'],
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/0f927680-9e83-4fae-b20b-e9980acf68ed' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HEALTH_FACILITY'
            }
          ]
        },
        physicalType: { coding: [{ code: 'bu', display: 'Building' }] },
        telecom: [],
        address: {
          line: ['', 'Narsingdi Sadar'],
          district: 'Narsingdi',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-12-12T12:47:11.487+00:00',
          versionId: '32329ae1-4320-4982-bede-998b6c1feb6e'
        },
        id: '7ec28833-ed70-438f-a757-87dba2cf5447'
      },
      request: { method: 'POST', url: 'Location' }
    }
  ]
}

export const mockMunicipality = {
  resourceType: 'Bundle',
  id: '17fb5ec6-27f4-4bcd-ad04-0671e6cd9e15',
  meta: { lastUpdated: '2019-12-12T13:39:50.445+00:00' },
  total: 1,
  link: [
    {
      relation: 'self',
      url:
        'http://localhost:3447/fhir/Location?identifier=division%3D3%26district%3D29%26upazila%3D229%26municipality%3DOpenCRVS_2'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/4d42078c-db46-48c2-bbbd-9591a7866d3e/_history/3d2db1f5-1ad7-4a08-b125-7fe26f750600',
      resource: {
        resourceType: 'Location',
        identifier: [
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '50' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'MUNICIPALITY'
          },
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
            value: 'division=3&district=29&upazila=229&municipality=OpenCRVS_2'
          }
        ],
        name: 'Narsingdi Paurasabha',
        alias: ['আমতলী '],
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/0f927680-9e83-4fae-b20b-e9980acf68ed' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: { coding: [{ code: 'jdn', display: 'Jurisdiction' }] },
        extension: [
          {
            url:
              'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          }
        ],
        meta: {
          lastUpdated: '2019-12-12T12:18:45.795+00:00',
          versionId: '3d2db1f5-1ad7-4a08-b125-7fe26f750600'
        },
        id: '4d42078c-db46-48c2-bbbd-9591a7866d3e'
      },
      request: { method: 'POST', url: 'Location' }
    }
  ]
}

export const mockUnknownUnionFacility = {
  resourceType: 'Bundle',
  id: 'c802dede-e7b6-498f-bae2-75787c843914',
  meta: { lastUpdated: '2019-12-12T13:45:06.112+00:00' },
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Location?identifier=24480'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/1f9e76a0-dcaf-4256-8d61-f01847020c30/_history/28945b65-2fe2-44c7-8978-46f3229044b6',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/hris-internal-id',
            value: '24480'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-uuid',
            value: '24ec514d-d542-401a-9a46-86dc34ce628f'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-code',
            value: '10024892'
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-union-name',
            value: ''
          },
          {
            system: 'http://opencrvs.org/specs/id/hris-paurasava-name',
            value: 'Unions Of Narsingdi Sadar Upazila'
          }
        ],
        name: 'Dr. Nuruzzaman Khokon CC - Narsingdi Sadar',
        alias: ['ডা: নুরুজ্জামান খোকন কমিউনিটি ক্লিনিক, নরসিংদী সদর।'],
        status: 'active',
        mode: 'instance',
        partOf: { reference: 'Location/0f927680-9e83-4fae-b20b-e9980acf68ed' },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'HEALTH_FACILITY'
            }
          ]
        },
        physicalType: { coding: [{ code: 'bu', display: 'Building' }] },
        telecom: [],
        address: {
          line: ['Mahishasura', 'Narsingdi Sadar'],
          district: 'Narsingdi',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-12-12T12:47:25.561+00:00',
          versionId: '28945b65-2fe2-44c7-8978-46f3229044b6'
        },
        id: '1f9e76a0-dcaf-4256-8d61-f01847020c30'
      },
      request: { method: 'POST', url: 'Location' }
    }
  ]
}
