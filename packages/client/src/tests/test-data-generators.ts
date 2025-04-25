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
import { eventPayloadGenerator, getUUID } from '@opencrvs/commons/client'
import { FetchUserQuery, Status } from '@client/utils/gateway'

/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function testDataGenerator() {
  const user = {
    token: {
      fieldAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWluY29tcGxldGUiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTc0Mzc2NTY1NywiZXhwIjoxNzQ0MzcwNDU3LCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYTk5In0.dGtl7zhEeMWK05KSJqGjRzHVxjSOV1d-5naUEENTTU_iA7NeCKaKXAbiJRWDTqyQgmnF_Rl1WCxrVYgmwZWWkRZ1FuPDwEOIuYcf5ZtLamiR-Bs0cS0V3D9xXuzAnawB5hWOlZYbopihXVeI0tOAy7_Zd3KCzUisDcGEi1I6m8jZ11jUdOevM1wWLDmr69pz4ZgSnGbBxqyXis138xnqL6-kExExzvG8o59-1sn98NO83PL7vole9-EZbZj8VKlJ8YKYA6GYNEeJZdKTh960JNMJrjBHn87JfeGH-nnBv3RGmyNYv7d7FEIRJacSyKBRz_gD6RWzLvzjWWYRbJ294A',
      registrationAgent:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItYXBwcm92YWwiLCJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci11cGRhdGVzIiwicmVjb3JkLmRlY2xhcmF0aW9uLWFyY2hpdmUiLCJyZWNvcmQuZGVjbGFyYXRpb24tcmVpbnN0YXRlIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1yZXF1ZXN0LWNvcnJlY3Rpb24iLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInNlYXJjaC5iaXJ0aCIsInNlYXJjaC5kZWF0aCIsInNlYXJjaC5tYXJyaWFnZSIsImRlbW8iXSwiaWF0IjoxNzQzNzY1NTc3LCJleHAiOjE3NDQzNzAzNzcsImF1ZCI6WyJvcGVuY3J2czphdXRoLXVzZXIiLCJvcGVuY3J2czp1c2VyLW1nbnQtdXNlciIsIm9wZW5jcnZzOmhlYXJ0aC11c2VyIiwib3BlbmNydnM6Z2F0ZXdheS11c2VyIiwib3BlbmNydnM6bm90aWZpY2F0aW9uLXVzZXIiLCJvcGVuY3J2czp3b3JrZmxvdy11c2VyIiwib3BlbmNydnM6c2VhcmNoLXVzZXIiLCJvcGVuY3J2czptZXRyaWNzLXVzZXIiLCJvcGVuY3J2czpjb3VudHJ5Y29uZmlnLXVzZXIiLCJvcGVuY3J2czp3ZWJob29rcy11c2VyIiwib3BlbmNydnM6Y29uZmlnLXVzZXIiLCJvcGVuY3J2czpkb2N1bWVudHMtdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhYTEifQ.cuRti6UG2ZyvI3zeGRv3ke0Vp1L1aK1jJiIQoHZF4YrZcLyvkeYDV6T0B0lPq9MRCe29NWm6gK5iJgwGwGX8eXjDMs-BlNjB07gojVrHSQfoRt7eAQOUgwY7g9o3CXQuGlr1pawVaWbJXyrLjXruZDpty_guSLideFiECXAwA_TnCk3Vl3xs32wiXI_QO55dfRx7jYc4sWcoTf3pk7oEBPuBz4XERjkDA9h9rw08LMFILAUJdVKapYqdvTNQ6qw1dsmdCZKYYA7sZsQuESYm8pi0JpD3WHARZzS_ZiLi7Ni4DavV7xIyABAcxmYUTNWZ02osFsmFLxyi43zCC_ufTQ',
      localRegistrar:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQucmVhZCIsInJlY29yZC5kZWNsYXJlLWJpcnRoIiwicmVjb3JkLmRlY2xhcmUtZGVhdGgiLCJyZWNvcmQuZGVjbGFyZS1tYXJyaWFnZSIsInJlY29yZC5kZWNsYXJhdGlvbi1lZGl0IiwicmVjb3JkLmRlY2xhcmF0aW9uLXN1Ym1pdC1mb3ItdXBkYXRlcyIsInJlY29yZC5yZXZpZXctZHVwbGljYXRlcyIsInJlY29yZC5kZWNsYXJhdGlvbi1hcmNoaXZlIiwicmVjb3JkLmRlY2xhcmF0aW9uLXJlaW5zdGF0ZSIsInJlY29yZC5yZWdpc3RlciIsInJlY29yZC5yZWdpc3RyYXRpb24tY29ycmVjdCIsInJlY29yZC5kZWNsYXJhdGlvbi1wcmludC1zdXBwb3J0aW5nLWRvY3VtZW50cyIsInJlY29yZC5leHBvcnQtcmVjb3JkcyIsInJlY29yZC51bmFzc2lnbi1vdGhlcnMiLCJyZWNvcmQucmVnaXN0cmF0aW9uLXByaW50Jmlzc3VlLWNlcnRpZmllZC1jb3BpZXMiLCJyZWNvcmQuY29uZmlybS1yZWdpc3RyYXRpb24iLCJyZWNvcmQucmVqZWN0LXJlZ2lzdHJhdGlvbiIsInBlcmZvcm1hbmNlLnJlYWQiLCJwZXJmb3JtYW5jZS5yZWFkLWRhc2hib2FyZHMiLCJwcm9maWxlLmVsZWN0cm9uaWMtc2lnbmF0dXJlIiwib3JnYW5pc2F0aW9uLnJlYWQtbG9jYXRpb25zOm15LW9mZmljZSIsInVzZXIucmVhZDpteS1vZmZpY2UiLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJkZW1vIl0sImlhdCI6MTc0Mzc0OTAxMSwiZXhwIjoxNzQ0MzUzODExLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciIsIm9wZW5jcnZzOnNlYXJjaC11c2VyIiwib3BlbmNydnM6bWV0cmljcy11c2VyIiwib3BlbmNydnM6Y291bnRyeWNvbmZpZy11c2VyIiwib3BlbmNydnM6d2ViaG9va3MtdXNlciIsIm9wZW5jcnZzOmNvbmZpZy11c2VyIiwib3BlbmNydnM6ZG9jdW1lbnRzLXVzZXIiXSwiaXNzIjoib3BlbmNydnM6YXV0aC1zZXJ2aWNlIiwic3ViIjoiNjdlZjdmODNkNmE5Y2I5MmU5ZWRhYWE5In0.Vn92CQoFto9QTH9YFjtzDAGcATlX37iviVLb6OBeiBzmsDSQZKO2ZGvhQBmjQS01O-SZ0f1D4qlgMaMkgyjKq-8QuwbxTHDG35wRIwBe_1NJ7VQFbhDJx-Sz70Pb4LgQdNaRpZBTOGaEkNNOWlO_Z4z5a9IW1SXg52ApprpwLHvpiQDalZ-sRWlmyjObqx8qdcNMCtxWaPRJaoR4Y7TM4MbKuS-Sx74P2UK5jel8QsHP6qG2iM7cTnq0L1PVAYrf5gT3IHqQGDwt4HrlZV-NyfId9FyRQCTjYrvgYM4gnHddtf7oaDk3fB5b5zc73HRYotvRibm99ncjD7-iOvyJtA'
    },
    id: {
      // If token is changed, id should also change accordingly
      localRegistrar: '67ef7f83d6a9cb92e9edaaa9',
      registrationAgent: '67ef7f83d6a9cb92e9edaaa1',
      fieldAgent: '67ef7f83d6a9cb92e9edaa99'
    },
    fieldAgent: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1736421510056',
        username: 'k.bwalya',
        practitionerId: getUUID(),
        mobile: '+260911111111',
        email: 'kalushabwalya17@gmail.com',
        role: {
          label: {
            id: 'userRole.socialWorker',
            defaultMessage: 'Social Worker',
            description: 'Name for user role Social Worker',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Kalusha',
            familyName: 'Bwalya',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      }) satisfies FetchUserQuery['getUser'],
    registrationAgent: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1736421510209',
        username: 'f.katongo',
        practitionerId: getUUID(),
        mobile: '+260922222222',
        email: 'kalushabwalya17+@gmail.com',
        role: {
          label: {
            id: 'userRole.registrationAgent',
            defaultMessage: 'Registration Agent',
            description: 'Name for user role Registration Agent',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Felix',
            familyName: 'Katongo',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: null,
        avatar: null,
        searches: [],
        __typename: 'User'
      }) satisfies FetchUserQuery['getUser'],
    localRegistrar: () =>
      ({
        id: getUUID(),
        userMgntUserID: getUUID(),
        creationDate: '1737725915295',
        username: 'k.mweene',
        practitionerId: getUUID(),
        mobile: '+260933333333',
        email: 'kalushabwalya1.7@gmail.com',
        role: {
          label: {
            id: 'userRole.localRegistrar',
            defaultMessage: 'Local Registrar',
            description: 'Name for user role Local Registrar',
            __typename: 'I18nMessage'
          },
          __typename: 'UserRole'
        },
        status: Status.Active,
        name: [
          {
            use: 'en',
            firstNames: 'Kennedy',
            familyName: 'Mweene',
            __typename: 'HumanName'
          }
        ],
        primaryOffice: {
          id: '028d2c85-ca31-426d-b5d1-2cef545a4902',
          name: 'Ibombo District Office',
          alias: ['Ibombo District Office'],
          status: 'active',
          __typename: 'Location'
        },
        localRegistrar: {
          name: [
            {
              use: 'en',
              firstNames: 'Kennedy',
              familyName: 'Mweene',
              __typename: 'HumanName'
            }
          ],
          role: 'LOCAL_REGISTRAR',
          signature: null,
          __typename: 'LocalRegistrar'
        },
        avatar: null,
        searches: [],
        __typename: 'User'
      }) satisfies FetchUserQuery['getUser']
  }

  return { event: eventPayloadGenerator, user }
}
