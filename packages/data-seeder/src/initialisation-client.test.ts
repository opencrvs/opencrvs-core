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
import { createServer, IncomingMessage, Server } from 'http'
import { AddressInfo } from 'net'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { createInitialisationClient } from './initialisation-client'

const env = vi.hoisted(() => ({
  EVENTS_URL: '',
  GATEWAY_HOST: 'http://gateway.invalid'
}))
vi.mock('./environment', () => ({ env }))

let server: Server
const requests: IncomingMessage[] = []

beforeAll(async () => {
  server = createServer((req, res) => {
    requests.push(req)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ result: { data: { json: null } } }))
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  env.EVENTS_URL = `http://localhost:${(server.address() as AddressInfo).port}/`
})

afterAll(() => {
  server.close()
})

it('calls the initialisation router on the events service, not through the gateway', async () => {
  await createInitialisationClient('token').complete.mutate()

  expect(requests).toHaveLength(1)
  // The events service serves `initialisationRouter` under `/initialisation/`
  expect(requests[0].url).toBe('/initialisation/complete')
  expect(requests[0].headers.authorization).toBe('Bearer token')
})
