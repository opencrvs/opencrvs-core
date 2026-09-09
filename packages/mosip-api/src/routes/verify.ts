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
import { DateValue, NameFieldValue, TextValue } from '@opencrvs/toolkit/events'
import { FastifyReply, FastifyRequest } from 'fastify'
import { verifyNid } from '../mosip-api'
import { z } from 'zod'

export const VerifySchema = z.object({
  nid: TextValue,
  dob: DateValue,
  name: NameFieldValue,
  gender: TextValue.optional(),
  transactionId: z.string().optional()
})

/** Handles the calls coming from OpenCRVS countryconfig */
export const verifyHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const body = VerifySchema.parse(request.body)

  const {
    response: { authStatus }
  } = await verifyNid({
    nid: body.nid,
    dob: body.dob.replaceAll('-', '/'),
    name: [
      {
        language: 'eng',
        value: `${body.name.firstname} ${body.name.surname}`
      }
    ],
    gender: body.gender ? [{ language: 'eng', value: body.gender }] : undefined
  })

  const transactionId = body.transactionId

  if (transactionId) {
    request.log.info({ transactionId, authStatus })
  }

  return reply.code(200).send(authStatus ? 'verified' : 'failed')
}
