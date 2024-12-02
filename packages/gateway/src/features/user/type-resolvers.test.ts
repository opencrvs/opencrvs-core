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
  IUserModelData,
  userTypeResolvers as typeResolvers
} from '@gateway/features/user/type-resolvers'

import { TestResolvers } from '@gateway/utils/testUtils'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as fetchAny.FetchMock

const userTypeResolvers = typeResolvers as unknown as TestResolvers

const mockGet = jest.fn()

beforeEach(() => {
  fetch.resetMocks()
})

describe('User type resolvers', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  const mockResponse: IUserModelData = {
    _id: 'ba7022f0ff4822',
    name: [
      {
        use: 'en',
        given: ['Tamim'],
        family: 'Iqbal'
      }
    ],
    username: 'tamim.iqlbal',
    mobile: '+8801711111111',
    email: 'test@test.org',
    scope: ['certify', 'profile.electronic-signature'],
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    creationDate: '1559054406433',
    role: 'REGISTRATION_AGENT',
    device: ''
  }

  it('return id type', () => {
    const res = userTypeResolvers.User!.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
  it('return userMgntUserID type', () => {
    const res = userTypeResolvers.User!.userMgntUserID(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
  it('return suspicious user flag', () => {
    const underInvestigationUserMockResponse = mockResponse
    underInvestigationUserMockResponse.status = 'deactivated'
    underInvestigationUserMockResponse.auditHistory = [
      {
        auditedBy: 'DUMMY_AUDITOR_ID',
        auditedOn: 1234897987,
        action: 'DEACTIVATE',
        reason: 'SUSPICIOUS'
      }
    ]
    const res = userTypeResolvers.User!.underInvestigation(mockResponse)
    expect(res).toBeTruthy()
  })

  it('return user signature as registration agent', async () => {
    const roleBundle = {
      resourceType: 'Bundle',
      id: 'e9b83485-0418-47a0-b62b-c9d80a89691b',
      total: 1,
      entry: [
        {
          resource: {
            resourceType: 'PractitionerRole',
            practitioner: {
              reference: 'Practitioner/dd78cad3-26dc-469a-bddb-0b45ae489491'
            },
            code: [
              {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/roles',
                    code: 'LOCAL_REGISTRAR'
                  }
                ]
              }
            ],
            location: [
              {
                reference: 'Location/54538456-fcf6-4276-86ac-122a7eb47703'
              },
              {
                reference: 'Location/319b0d8f-e330-45b8-8bd5-863a234d4cc5'
              }
            ],
            id: '7c246f38-90c7-4f80-8266-f884c6e7b491'
          }
        }
      ]
    }
    const practitioner = {
      resourceType: 'Practitioner',
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueAttachment: {
            contentType: 'img/png',
            url: '/ocrvs/a1-b2-c3.png',
            creation: '1721970080786'
          }
        }
      ],
      id: 'dd78cad3-26dc-469a-bddb-0b45ae489491'
    }
    const presignedURL =
      'http://minio.farajaland-dev.opencrvs.org/ocrvs/cbf7c3cd-1b59-40b0-b8f9-2cd1310fe85b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20240726%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20240726T094242Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=2eb6a0cdfb9d25f347771b3f10cba442946d09de035f3294d8edec49e09ec1a6'

    fetch.mockResponses(
      [JSON.stringify(roleBundle), { status: 200 }],
      [JSON.stringify({ presignedURL }), { status: 200 }],
      [JSON.stringify(practitioner), { status: 200 }]
    )

    const response = await userTypeResolvers.User!.localRegistrar(
      mockResponse,
      undefined,
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmV2aWV3IiwicmVjb3JkLnN1Ym1pdC1mb3ItYXBwcm92YWwiLCJyZWNvcmQuc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1yZXF1ZXN0LWNvcnJlY3Rpb24iLCJyZWNvcmQucHJpbnQtcmVjb3JkcyIsInJlY29yZC5wcmludC1yZWNvcmRzLXN1cHBvcnRpbmctZG9jdW1lbnRzIiwicmVjb3JkLmV4cG9ydC1yZWNvcmRzIiwicmVjb3JkLnByaW50LWlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY2VydGlmeSIsInJlY29yZC5yZWdpc3RyYXRpb24tdmVyaWZ5LWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY3JlYXRlLWNvbW1lbnRzIiwicGVyZm9ybWFuY2UucmVhZCIsInBlcmZvcm1hbmNlLnJlYWQtZGFzaGJvYXJkcyIsIm9yZ2FuaXNhdGlvbi5yZWFkIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsInJlY29yZC5yZWFkIiwicmVjb3JkLnJlYWQtYXVkaXQiLCJyZWNvcmQucmVhZC1jb21tZW50cyIsImRlbW8iXSwiaWF0IjoxNzMwODk2MjAwLCJleHAiOjE3MzE1MDEwMDAsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2NzI4YWE3YTU4Yjc4YzA0MDljOWZjYzkifQ.OQ0Rg3ZJ9aolQCz4brSsscidgMgY_NaLpuigGXiBRTkyNH9N4HHk6cFSDfIGTfIiBekhJ0i-AVP_1Oo_2AzdymE9sX_qTO_E_xPqrMMK8tlsg8GHEfrUQgTmVFDTdezh2Cby-AQKZIzzr2GiFRA1pAk2dHSTFTWpDFR_YtbaBg6BsgrIOmAo4YIBuI7AoY71kKYrN9M5PYtVfchtvUTjPxLlmaf8P-pB2dNjuExKh174EvbUDVkFCHm_WX4pK9pG6DdLhd1DkIE1wj7_WW1T2RmRuWFqRliBAS5JLtx9r098yYUMUmXPc3vXFtXRZMUItGRkPIBkx38aBXAkRAwK6A'
        },
        dataSources: {
          fhirAPI: {
            getPractitioner: () => practitioner
          }
        }
      }
    )

    expect(response).toEqual({
      role: 'LOCAL_REGISTRAR',
      name: undefined,
      signature: presignedURL
    })
  })

  it('return user signature as registrar', async () => {
    const presignedURL =
      'http://minio.farajaland-dev.opencrvs.org/ocrvs/cbf7c3cd-1b59-40b0-b8f9-2cd1310fe85b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20240726%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20240726T094242Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=2eb6a0cdfb9d25f347771b3f10cba442946d09de035f3294d8edec49e09ec1a6'

    const practitioner = {
      // role: 'REGISTRATION_AGENT',
      resourceType: 'Practitioner',
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueAttachment: {
            contentType: 'img/png',
            url: '/ocrvs/a1-b2-c3.png',
            creation: '1721970080786'
          }
        }
      ],
      id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de'
    }
    fetch.mockResponses(
      [JSON.stringify({ presignedURL }), { status: 200 }],
      [JSON.stringify(practitioner), { status: 200 }]
    )

    const userResponse = mockResponse
    userResponse.scope!.push('record.register')

    const response = await userTypeResolvers.User!.localRegistrar(
      userResponse,
      undefined,
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmV2aWV3IiwicmVjb3JkLnN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5wcmludC1yZWNvcmRzIiwicmVjb3JkLnByaW50LXJlY29yZHMtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQucHJpbnQtaXNzdWUtY2VydGlmaWVkLWNvcGllcyIsInJlY29yZC5yZWdpc3RyYXRpb24tdmVyaWZ5LWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY3JlYXRlLWNvbW1lbnRzIiwicmVjb3JkLmNlcnRpZnkiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQiLCJvcmdhbmlzYXRpb24ucmVhZC1sb2NhdGlvbnM6bXktb2ZmaWNlIiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwicmVjb3JkLnJlYWQiLCJyZWNvcmQucmVhZC1hdWRpdCIsInJlY29yZC5yZWFkLWNvbW1lbnRzIiwiZGVtbyJdLCJpYXQiOjE3MzA4OTc0MzAsImV4cCI6MTczMTUwMjIzMCwiYXVkIjpbIm9wZW5jcnZzOmF1dGgtdXNlciIsIm9wZW5jcnZzOnVzZXItbWdudC11c2VyIiwib3BlbmNydnM6aGVhcnRoLXVzZXIiLCJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJvcGVuY3J2czpub3RpZmljYXRpb24tdXNlciIsIm9wZW5jcnZzOndvcmtmbG93LXVzZXIiLCJvcGVuY3J2czpzZWFyY2gtdXNlciIsIm9wZW5jcnZzOm1ldHJpY3MtdXNlciIsIm9wZW5jcnZzOmNvdW50cnljb25maWctdXNlciIsIm9wZW5jcnZzOndlYmhvb2tzLXVzZXIiLCJvcGVuY3J2czpjb25maWctdXNlciIsIm9wZW5jcnZzOmRvY3VtZW50cy11c2VyIl0sImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3MjhhYTdhNThiNzhjMDQwOWM5ZmNkMSJ9.DI7ejwGdsX_w7fVGQGSiTassHa06pa7jdefa_w5gXM10rKa0vO1h_sc5D0DtCdhTUDDmeAQr0YUY2ZpzgOGORjq-VTm9VCYIf4w9H4tVKaUmtyVGm5r2JMlXKa-7XkgH9WGU7fcblWWCISV28WvJIznCE89Ye_wGPe38cQYSo4xFK8cP7QHeXyVaGxWqrPL_1ZO8YVgm3F0dmXTJxzZ0F7GSKu4_WVXYOiMsTs66jn6SYrF5u8LKLkf0mrCP4PxTRSA-TFS572vEXklhdelAYiKK8z7Rh68KRMsQJ7prLBkutN_cS6k5xgQxTBO4bezjy4zHqKn4m25Gyej6AhoOBA'
        },
        dataSources: {
          fhirAPI: {
            getPractitioner: () => practitioner
          }
        }
      }
    )

    expect(response).toEqual({
      role: 'REGISTRATION_AGENT',
      signature: presignedURL
    })
  })
})
