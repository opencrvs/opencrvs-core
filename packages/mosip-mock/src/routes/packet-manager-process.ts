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
import { RouteHandlerMethod } from 'fastify'

export const packetManagerProcessHandler: RouteHandlerMethod = async (
  _request,
  reply
) => {
  return reply.status(200).send({
    id: 'mosip.registration.processor.workflow.instance',
    version: 'v1',
    responsetime: new Date().toISOString(),
    response: {
      workflowInstanceId: 'dd9f218b-279c-4d93-8cda-9857976293ea'
    },
    errors: null
  })
}
