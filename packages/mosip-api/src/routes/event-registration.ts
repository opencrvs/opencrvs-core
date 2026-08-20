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
import { insertTransaction } from '../database'
import { MosipInteropPayloadSchema } from '@opencrvs/mosip/api'
import { env } from '../constants'

const generateTransactionId = (prefix = env.TRANSACTION_ID_PREFIX) => {
  return `${prefix}${Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')}`
}

/** Handles the calls coming from OpenCRVS countryconfig */
export const registrationEventHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const body = MosipInteropPayloadSchema.parse(request.body)

  const {
    trackingId,
    requestFields,
    schemaJson,
    audit,
    metaInfo,
    notification
  } = body

  const token = request.headers.authorization!.split(' ')[1]

  request.log.info({ trackingId }, 'Received record from OpenCRVS')

  const birthCertificateNumber = requestFields.birthCertificateNumber

  if (birthCertificateNumber) {
    const transactionId = generateTransactionId()

    request.log.info({ transactionId }, 'Event ID')

    insertTransaction(transactionId, token, birthCertificateNumber)

    await mosip.postBirthRecord({
      event: { id: transactionId, trackingId },
      requestFields,
      schemaJson,
      audit,
      metaInfo,
      notification
    })
  }

  const deathCertificateNumber = requestFields.deathCertificateNumber

  if (deathCertificateNumber) {
    const transactionId = generateTransactionId()

    request.log.info({ transactionId }, 'Event ID')

    insertTransaction(transactionId, token, deathCertificateNumber)

    await mosip.postDeathRecord({
      event: { id: transactionId, trackingId },
      requestFields,
      schemaJson,
      audit,
      metaInfo,
      notification
    })
  }

  return reply.code(202).send({})
}
