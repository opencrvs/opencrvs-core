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
/* eslint-disable @typescript-eslint/no-var-requires */
import { createServer } from '@metrics/server'
import * as api from '@metrics/api'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetchAny from 'jest-fetch-mock'
import { testDeclaration } from '@metrics/features/registration/testUtils'
import { cloneDeep } from 'lodash'

const fetch = fetchAny as any
const fetchTaskHistory = api.fetchTaskHistory as jest.Mock

const token = jwt.sign(
  { scope: ['declare'] },
  readFileSync('./test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:metrics-user'
  }
)

jest.mock('../metrics/utils', () => {
  const originalModule = jest.requireActual('../metrics//utils')
  return {
    __esModule: true,
    ...originalModule,
    getRegistrationTargetDays: () => 45
  }
})

describe('When a new registration event is received', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.mockResponses(
      [
        JSON.stringify({
          id: '1',
          partOf: {
            reference: 'Location/4'
          }
        })
      ],
      [
        JSON.stringify({
          id: '2',
          partOf: {
            reference: 'Location/3'
          }
        })
      ],
      [
        JSON.stringify({
          id: '3',
          partOf: {
            reference: 'Location/2'
          }
        })
      ]
    )
  })

  it('returns ok for valid new birth declaration', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/sent-notification-for-review',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: testDeclaration
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 500 for invalid payload in new birth registration', async () => {
    const payload = cloneDeep(testDeclaration)
    // @ts-ignore
    payload.entry[0] = {}
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/sent-notification-for-review',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })

    expect(res.statusCode).toBe(500)
  })
})

describe('When an existing declaration is marked registered', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })
  it('writes the delta between DECLARED and VALIDATED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/sent-for-approval-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/sent-for-approval',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })
  it('writes the delta between DECLARED and REGISTERED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-registered-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/registered',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })
  it('writes the delta between VALIDATED and WAITING_VALIDATION states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/waiting-validation-request.json')
    const taskHistory = require('./test-data/task-history-validated-response.json')
    fetchTaskHistory.mockReset()
    fetchTaskHistory.mockResolvedValue(taskHistory)
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/waiting-external-validation',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[0][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })

  it('writes the delta between VALIDATED and REGISTERED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-registered-request.json')
    const taskHistory = require('./test-data/task-history-validated-response.json')
    fetchTaskHistory.mockReset()
    fetchTaskHistory.mockResolvedValue(taskHistory)
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/registered',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )
    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })

  describe('a death declaration', () => {
    it('writes the delta between REGISTERED and CERTIFIED states to influxdb', async () => {
      const influxClient = require('@metrics/influxdb/client')
      const payload = require('./test-data/mark-death-registered-request.json')
      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/registered',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload
      })
      const declarationEventPoint =
        influxClient.writePoints.mock.calls[1][0].find(
          ({ measurement }: { measurement: string }) =>
            measurement === 'declaration_event_duration'
        )

      expect(res.statusCode).toBe(200)
      expect(declarationEventPoint).toMatchSnapshot()
    })
  })
})
describe('When an existing declaration is marked certified', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('writes the delta between REGISTERED and CERTIFIED states to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/mark-certified-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/certified',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const declarationEventPoint =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'declaration_event_duration'
      )

    expect(res.statusCode).toBe(200)
    expect(declarationEventPoint).toMatchSnapshot()
  })
  describe('a death declaration', () => {
    it('writes the delta between REGISTERED and CERTIFIED states to influxdb', async () => {
      const influxClient = require('@metrics/influxdb/client')
      const payload = require('./test-data/mark-death-certified-request.json')
      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/certified',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload
      })
      expect(res.statusCode).toBe(200)
      const declarationEventPoint =
        influxClient.writePoints.mock.calls[1][0].find(
          ({ measurement }: { measurement: string }) =>
            measurement === 'declaration_event_duration'
        )

      expect(declarationEventPoint).toMatchSnapshot()
    })
  })
  describe('a birth declaration', () => {
    it('writes the declaration_event_duration to influxdb', async () => {
      const influxClient = require('@metrics/influxdb/client')
      const payload = require('./test-data/mark-certified-request.json')
      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/certified',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload
      })
      expect(res.statusCode).toBe(200)
      const declarationEventDurationPoint =
        influxClient.writePoints.mock.calls[1][0].find(
          ({ measurement }: { measurement: string }) => {
            return measurement === 'declaration_event_duration'
          }
        )

      expect(declarationEventDurationPoint).toMatchSnapshot()
    })
  })
})

describe('When an in-progress declaration is received', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('writes the in complete field points to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/sent-notification-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/sent-notification',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const inCompleteFieldPoints =
      influxClient.writePoints.mock.calls[1][0].find(
        ({ measurement }: { measurement: string }) =>
          measurement === 'in_complete_fields'
      )

    expect(res.statusCode).toBe(200)
    expect(inCompleteFieldPoints).toMatchSnapshot()
  })
  it('returns 500 for payload without expected extension on task resource', async () => {
    const payload = require('./test-data/sent-notification-request.json')
    payload.entry[1].resource.extension = []
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/sent-notification',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    expect(res.statusCode).toBe(500)
  })

  it('writes the rejected points to influxdb', async () => {
    const influxClient = require('@metrics/influxdb/client')
    const payload = require('./test-data/sent-for-updates-request.json')
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/sent-for-updates',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    const rejectedPoints = influxClient.writePoints.mock.calls[1][0].find(
      ({ measurement }: { measurement: string }) =>
        measurement === 'declarations_rejected'
    )

    expect(res.statusCode).toBe(200)
    expect(rejectedPoints).toMatchSnapshot()
  })
  it('returns 500 for payload without task resource', async () => {
    const payload = require('./test-data/sent-for-updates-request.json')
    payload.entry = []
    const res = await server.server.inject({
      method: 'POST',
      url: '/events/birth/sent-for-updates',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload
    })
    expect(res.statusCode).toBe(500)
  })
})
