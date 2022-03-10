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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { transformBirthBundle } from '@webhooks/features/event/service'

import * as fetchMock from 'jest-fetch-mock'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

const taskBundle = {
  resourceType: 'Bundle',
  type: '',
  entry: [
    {
      resource: {
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'BIRTH'
            }
          ]
        },
        focus: {
          reference: 'Composition/e9e2ff8d-1eac-412b-8bbc-408e90276a3f'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '53fe6974-6140-4e50-afc7-998a9018709b'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B6E6YJB'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2020B6E6YJB'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-relationship',
            valueString: ''
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260965656563'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 52942
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c3355b48-7790-43c7-b8f0-10c7316f9bed'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/1b4092e0-d391-45cd-89d4-162a81f0f63f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/4ec9c980-0b2f-436a-b49e-203e1e601620'
            }
          }
        ],
        lastModified: '2020-09-27T09:15:20.015Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2020-09-27T09:15:20.040+00:00',
          versionId: 'cfbefeac-bda0-4339-9745-9d54e7816c7d'
        },
        id: '60ec435c-1370-4314-ab0b-f44507f0db24'
      }
    }
  ]
}

const compositionResource = {
  identifier: { system: 'urn:ietf:rfc:3986', value: 'B6E6YJB' },
  resourceType: 'Composition',
  status: 'preliminary',
  type: {
    coding: [
      { system: 'http://opencrvs.org/doc-types', code: 'birth-declaration' }
    ],
    text: 'Birth Declaration'
  },
  class: {
    coding: [
      { system: 'http://opencrvs.org/doc-classes', code: 'crvs-document' }
    ],
    text: 'CRVS Document'
  },
  title: 'Birth Declaration',
  section: [
    {
      title: 'Supporting Documents',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'supporting-documents'
          }
        ],
        text: 'Supporting Documents'
      },
      entry: [
        { reference: 'DocumentReference/bf503f30-1d0a-40dc-908f-9c0d5e9cdf23' }
      ]
    },
    {
      title: 'Child details',
      code: {
        coding: [
          { system: 'http://opencrvs.org/doc-sections', code: 'child-details' }
        ],
        text: 'Child details'
      },
      entry: [{ reference: 'Patient/1e9ca16b-7c9a-469d-8101-ddd0db229077' }]
    },
    {
      title: "Mother's details",
      code: {
        coding: [
          { system: 'http://opencrvs.org/doc-sections', code: 'mother-details' }
        ],
        text: "Mother's details"
      },
      entry: [{ reference: 'Patient/6795ce21-7e53-4595-8fea-3b8d39cd0747' }]
    },
    {
      title: 'Birth encounter',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/sections',
            code: 'birth-encounter'
          }
        ],
        text: 'Birth encounter'
      },
      entry: [{ reference: 'Encounter/530b3b13-fb32-4879-8740-13856e8682b8' }]
    }
  ],
  subject: {},
  date: '2020-09-27T09:15:19.452Z',
  author: [],
  meta: {
    lastUpdated: '2020-09-27T09:15:20.035+00:00',
    versionId: '561541cb-430d-4ead-8c31-d6e0851edb70'
  },
  id: 'e9e2ff8d-1eac-412b-8bbc-408e90276a3f'
}

const childResource = {
  resourceType: 'Patient',
  active: true,
  name: [{ use: 'en', given: ['esrgstg'], family: ['srthsrt'] }],
  gender: 'male',
  birthDate: '2019-12-23',
  multipleBirthInteger: 1,
  meta: {
    lastUpdated: '2020-09-27T09:15:20.166+00:00',
    versionId: '9f5f1a5e-7059-4f5b-bf2f-8aa4f641b37c'
  },
  id: '1e9ca16b-7c9a-469d-8101-ddd0db229077',
  identifier: [{ type: 'BIRTH_REGISTRATION_NUMBER', value: '2020B6E6YJB' }]
}

const documentResource = {
  resourceType: 'DocumentReference',
  masterIdentifier: {
    system: 'urn:ietf:rfc:3986',
    value: 'd3240515-3d90-4f1a-bbb6-6530477565bd'
  },
  status: 'current',
  content: [
    {
      attachment: {
        contentType: 'image/png',
        data: 'data:image/png;base64,iVBORw0KJLX...'
      }
    }
  ],
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/supporting-doc-type',
        code: 'NATIONAL_ID_FRONT'
      }
    ]
  },
  subject: { display: 'MOTHER' },
  meta: {
    lastUpdated: '2020-09-27T09:15:20.042+00:00',
    versionId: '0307d10f-f2c1-42be-a0d3-b09c268a38cf'
  },
  id: 'bf503f30-1d0a-40dc-908f-9c0d5e9cdf23'
}

const mosipBundle = {
  resourceType: 'Bundle',
  type: '',
  entry: [
    {
      resource: {
        resourceType: 'Task',
        status: 'requested',
        code: {
          coding: [{ system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }]
        },
        focus: {
          reference: 'Composition/e9e2ff8d-1eac-412b-8bbc-408e90276a3f'
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/draft-id',
            value: '53fe6974-6140-4e50-afc7-998a9018709b'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B6E6YJB'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-registration-number',
            value: '2020B6E6YJB'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-relationship',
            valueString: ''
          },
          {
            url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
            valueString: '+260965656563'
          },
          {
            url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
            valueInteger: 52942
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastUser',
            valueReference: {
              reference: 'Practitioner/c3355b48-7790-43c7-b8f0-10c7316f9bed'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastLocation',
            valueReference: {
              reference: 'Location/1b4092e0-d391-45cd-89d4-162a81f0f63f'
            }
          },
          {
            url: 'http://opencrvs.org/specs/extension/regLastOffice',
            valueReference: {
              reference: 'Location/4ec9c980-0b2f-436a-b49e-203e1e601620'
            }
          }
        ],
        lastModified: '2020-09-27T09:15:20.015Z',
        businessStatus: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/reg-status',
              code: 'REGISTERED'
            }
          ]
        },
        meta: {
          lastUpdated: '2020-09-27T09:15:20.040+00:00',
          versionId: 'cfbefeac-bda0-4339-9745-9d54e7816c7d'
        },
        id: '60ec435c-1370-4314-ab0b-f44507f0db24'
      }
    },
    {
      resource: {
        resourceType: 'Patient',
        active: true,
        name: [{ use: 'en', given: ['esrgstg'], family: ['srthsrt'] }],
        gender: 'male',
        birthDate: '2019-12-23',
        multipleBirthInteger: 1,
        meta: {
          lastUpdated: '2020-09-27T09:15:20.166+00:00',
          versionId: '9f5f1a5e-7059-4f5b-bf2f-8aa4f641b37c'
        },
        id: '1e9ca16b-7c9a-469d-8101-ddd0db229077',
        identifier: [
          { type: 'BIRTH_REGISTRATION_NUMBER', value: '2020B6E6YJB' }
        ]
      }
    },
    {
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          system: 'urn:ietf:rfc:3986',
          value: 'd3240515-3d90-4f1a-bbb6-6530477565bd'
        },
        status: 'current',
        content: [
          {
            attachment: {
              contentType: 'image/png',
              data: 'data:image/png;base64,iVBORw0KJLX...'
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/supporting-doc-type',
              code: 'NATIONAL_ID_FRONT'
            }
          ]
        },
        subject: { display: 'MOTHER' },
        meta: {
          lastUpdated: '2020-09-27T09:15:20.042+00:00',
          versionId: '0307d10f-f2c1-42be-a0d3-b09c268a38cf'
        },
        id: 'bf503f30-1d0a-40dc-908f-9c0d5e9cdf23'
      }
    }
  ]
}

describe('Webhook transformBirthBundle for national id integration', () => {
  describe('transformBirthBundle', () => {
    beforeEach(async () => {
      fetch.resetMocks()
    })

    it('should return a bundle for MOSIP integration', async () => {
      fetch.mockResponses(
        [JSON.stringify(compositionResource), { status: 200 }],
        [JSON.stringify(childResource), { status: 200 }],
        [JSON.stringify(documentResource), { status: 200 }]
      )

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:webhooks-user'
      })

      const authHeader = {
        Authorization: `Bearer ${token}`,
        'x-correlation-id': '1'
      }

      const transformedBundle = await transformBirthBundle(
        taskBundle,
        'nationalId',
        authHeader
      )

      expect(transformedBundle).toEqual(mosipBundle)
    })

    afterAll(async () => {
      jest.clearAllMocks()
    })
  })
})
