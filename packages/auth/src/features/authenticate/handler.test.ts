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
import * as fetchAny from 'jest-fetch-mock'
import { createProductionEnvironmentServer } from '@auth/tests/util'
import { createServer, AuthServer } from '@auth/server'
import { encodeScope } from '@opencrvs/commons'

export const DEFAULT_ROLES_DEFINITION = [
  {
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      })
    ]
  },
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Agent',
      description: 'Name for user role Registration Agent',
      id: 'userRole.registrationAgent'
    },
    scopes: [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'organisation.read-locations' })
    ]
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Local Registrar',
      description: 'Name for user role Local Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.review-duplicates',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'profile.electronic-signature' }),
      encodeScope({ type: 'organisation.read-locations' })
    ]
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Local System Admin',
      description: 'Name for user role Local System Admin',
      id: 'userRole.localSystemAdmin'
    },
    scopes: [
      encodeScope({ type: 'user.read', options: { accessLevel: 'location' } }),
      encodeScope({
        type: 'user.create',
        options: { accessLevel: 'administrativeArea' }
      }),
      encodeScope({
        type: 'user.edit',
        options: { accessLevel: 'administrativeArea' }
      }),
      encodeScope({ type: 'organisation.read-locations' }),
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'performance.vital-statistics-export' })
    ]
  },
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'National System Admin',
      description: 'Name for user role National System Admin',
      id: 'userRole.nationalSystemAdmin'
    },
    scopes: [
      encodeScope({ type: 'user.create' }),
      encodeScope({ type: 'user.read' }),
      encodeScope({ type: 'user.edit' }),
      encodeScope({ type: 'organisation.read-locations' }),
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'performance.vital-statistics-export' })
    ]
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Performance Manager',
      description: 'Name for user role Performance Manager',
      id: 'userRole.performanceManager'
    },
    scopes: [
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'performance.vital-statistics-export' })
    ]
  }
] satisfies Array<{
  id: string
  label: { defaultMessage: string; description: string; id: string }
  scopes: string[]
}>

const fetch = fetchAny as fetchAny.FetchMock
describe('authenticate handler receives a request', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockReject(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockReject(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('auth service returns 403 for deactivated users', () => {
    it('returns 403', async () => {
      fetch.mockResponse(
        JSON.stringify({
          id: '1',
          status: 'deactivated',
          scope: ['admin']
        })
      )
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(res.statusCode).toBe(403)
    })
    it('generates a mobile verification code and sends it to notification gateway', async () => {
      server = await createProductionEnvironmentServer()

      /* eslint-disable @typescript-eslint/no-require-imports */
      /* eslint-disable @typescript-eslint/no-var-requires */
      const reloadedCodeService = require('../verifyCode/service')

      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      fetch.mockResponseOnce(
        JSON.stringify({
          id: '1',
          status: 'active',
          role: 'NATIONAL_SYSTEM_ADMIN',
          mobile: `+345345343`
        })
      )

      fetch.mockResponse(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })
      const spy = jest.spyOn(reloadedCodeService, 'sendVerificationCode')

      await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]).toHaveLength(5)
      expect(spy.mock.calls[0][3]).toBe('+345345343')
    })
    it('does not generate a mobile verification code for pending users', async () => {
      server = await createProductionEnvironmentServer()

      const reloadedCodeService = require('../verifyCode/service')

      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      fetch.mockResponseOnce(
        JSON.stringify({
          id: '1',
          status: 'pending',
          role: 'NATIONAL_SYSTEM_ADMIN',
          mobile: `+345345343`
        })
      )

      fetch.mockResponse(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })

      const spy = jest.spyOn(reloadedCodeService, 'sendVerificationCode')

      await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(spy).not.toHaveBeenCalled()
    })
  })
})
