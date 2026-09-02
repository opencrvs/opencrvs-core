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
import { FastifyRequest, FastifyReply } from 'fastify'
import * as mosip from '../mosip-api'
import crypto from 'node:crypto'
import { z } from 'zod'

const MosipCorrectionPayloadSchema = z.object({
  trackingId: z.string(),
  notification: z.object({
    recipientFullName: z.string(),
    recipientEmail: z.string(),
    recipientPhone: z.string()
  }),
  requestFields: z.object({
    VID: z.string(),
    fullName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    introducerInfoToken: z.string().optional()
  }),
  schemaJson: z.string().optional(),
  metaInfo: z.record(z.string(), z.unknown()),
  audit: z.record(z.string(), z.unknown())
})

export const updateBiographicsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const body = MosipCorrectionPayloadSchema.parse(request.body)

  const {
    trackingId,
    requestFields,
    schemaJson,
    audit,
    metaInfo,
    notification
  } = body

  request.log.info({ trackingId }, 'Received correction update from OpenCRVS')

  await mosip.postDemographicUpdateRecord({
    event: { id: crypto.randomUUID(), trackingId },
    requestFields,
    schemaJson,
    audit,
    metaInfo,
    notification
  })

  return reply.code(202).send({})
}
