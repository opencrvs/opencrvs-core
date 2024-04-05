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
import { rest } from 'msw'
import { practitioner } from './mocks/practitioner'
import { practitionerRoleBundle } from './mocks/practitionerRole'
import { user } from './mocks/user'
import { office, district, state } from './mocks/locations'
import { TransactionResponse } from '@workflow/records/fhir'
import { RecordEvent } from '@workflow/records/record-events'

const userHandler = rest.post(
  'http://localhost:3030/getUser',
  (_, res, ctx) => {
    return res(ctx.json(user))
  }
)

const practitionerHandler = rest.get(
  'http://localhost:3447/fhir/Practitioner/:practitionerId',
  (_, res, ctx) => {
    return res(ctx.json(practitioner))
  }
)

const practitionerRoleHandler = rest.get(
  'http://localhost:3447/fhir/PractitionerRole',
  (_, res, ctx) => {
    return res(ctx.json(practitionerRoleBundle))
  }
)

const locationHandler = rest.get(
  'http://localhost:3447/fhir/Location/:locationId',
  (req, res, ctx) => {
    const { locationId } = req.params
    const officeId = 'ce73938d-a188-4a78-9d19-35dfd4ca6957'
    const districtId = '0f7684aa-8c65-4901-8318-bf1e22c247cb'
    const stateId = 'ed6195ff-0f83-4852-832e-dc9db07151ff'

    if (locationId === officeId) {
      return res(ctx.json(office))
    } else if (locationId === districtId) {
      return res(ctx.json(district))
    } else if (locationId === stateId) {
      return res(ctx.json(state))
    }
    throw new Error(`no mock set for ${locationId}`)
  }
)

const indexBundleHandler = rest.post(
  'http://localhost:9090/record',
  (_, res, ctx) => {
    return res(ctx.status(200))
  }
)

const auditEventHandler = rest.post(
  'http://localhost:1050/events/birth/:action',
  (req, res, ctx) => {
    const { action } = req.params
    const knownActions = [
      'sent-notification-for-review',
      'sent-for-approval',
      'sent-for-updates',
      'waiting-external-validation',
      'registered',
      'certified',
      'reinstated',
      'issued'
    ] satisfies RecordEvent[]
    if (!knownActions.includes(action as (typeof knownActions)[number])) {
      throw new Error(`no mock set for "${action}" audit action`)
    }
    return res(ctx.status(200))
  }
)

const sendNotificationHandler = rest.post(
  'http://localhost:2020/birth/:event',
  (req, res, ctx) => {
    const { event } = req.params
    const knownActions = ['ready-for-review']
    if (!knownActions.includes(event as string)) {
      throw new Error(`no mock set for "${event}" notification event`)
    }
    return res(ctx.status(200))
  }
)

const notificationFlagsHandler = rest.get(
  'http://localhost:2021/informantSMSNotification',
  (_, res, ctx) => {
    return res(ctx.json([]))
  }
)

const duplicatesHandler = rest.post(
  'http://localhost:9090/search/duplicates/:event',
  (req, res, ctx) => {
    const { event } = req.params
    if (event === 'birth' || event === 'death') {
      return res(ctx.json([]))
    }
    throw new Error(`no mock set for ${event} duplicates`)
  }
)
const hearthHandler = rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
  const responseBundle: TransactionResponse = {
    resourceType: 'Bundle',
    type: 'batch-response',
    entry: []
  }

  return res(ctx.json(responseBundle))
})

const handlers = [
  userHandler,
  practitionerHandler,
  practitionerRoleHandler,
  locationHandler,
  notificationFlagsHandler,
  duplicatesHandler,
  indexBundleHandler,
  auditEventHandler,
  sendNotificationHandler,
  hearthHandler
]

export default handlers
