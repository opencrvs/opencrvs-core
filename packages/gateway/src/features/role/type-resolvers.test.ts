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
import { roleTypeResolvers } from '@gateway/features/role/type-resolvers'
import * as fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

describe('Role type resolvers', () => {
  const mockResponse = {
    _id: 'ba7022f0ff4822',
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    roles: [
      {
        value: 'FIELD_AGENT',
        roles: [
          {
            lang: 'en',
            label: 'Healthcare Worker'
          },
          {
            lang: 'fr',
            label: 'Professionnel de Santé'
          },
          {
            lang: 'en',
            label: 'Police Officer'
          },
          {
            lang: 'fr',
            label: 'Agent de Police'
          },
          {
            lang: 'en',
            label: 'Social Worker'
          },
          {
            lang: 'fr',
            label: 'Travailleur Social'
          },
          {
            lang: 'en',
            label: 'Local Leader'
          },
          {
            lang: 'fr',
            label: 'Leader Local'
          }
        ],
        active: true
      },
      {
        value: 'REGISTRATION_AGENT',
        roles: [
          {
            lang: 'en',
            label: 'Registration Agent'
          },
          {
            lang: 'fr',
            label: "Agent d'enregistrement"
          }
        ],
        active: true
      },
      {
        value: 'LOCAL_REGISTRAR',
        roles: [
          {
            lang: 'en',
            label: 'Local Registrar'
          },
          {
            lang: 'fr',
            label: 'Registraire local'
          }
        ],
        active: true
      },
      {
        value: 'LOCAL_SYSTEM_ADMIN',
        roles: [
          {
            lang: 'en',
            label: 'Local System_admin'
          },
          {
            lang: 'fr',
            label: 'Administrateur système local'
          }
        ],
        active: true
      },
      {
        value: 'NATIONAL_SYSTEM_ADMIN',
        roles: [
          {
            lang: 'en',
            label: 'National System_admin'
          },
          {
            lang: 'fr',
            label: 'Administrateur système national'
          }
        ],
        active: true
      },
      {
        value: 'PERFORMANCE_MANAGEMENT',
        roles: [
          {
            lang: 'en',
            label: 'Performance Management'
          },
          {
            lang: 'fr',
            label: 'Gestion des performances'
          }
        ],
        active: true
      },
      {
        value: 'NATIONAL_REGISTRAR',
        roles: [
          {
            lang: 'en',
            label: 'National Registrar'
          },
          {
            lang: 'fr',
            label: 'Registraire national'
          }
        ],
        active: true
      }
    ],
    active: true,
    creationDate: 1559054406433
  }
  it('return id type', () => {
    const res = roleTypeResolvers.SystemRole.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
})
