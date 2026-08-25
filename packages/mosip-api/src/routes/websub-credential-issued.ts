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
import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getTransactionAndDiscard } from '../database'
import { decode } from 'jsonwebtoken'
import * as opencrvs from '../opencrvs-api'
import { decryptMosipCredential } from '../websub/crypto'
import { env } from '../constants'
import { getBirthIdentifier } from '../websub/verify-vc'
import { verifyHubSignatureOrThrow } from '../websub/verify-hub-signature'
import { ActionType } from '@opencrvs/toolkit/events'

export const CredentialIssuedSchema = z.object({
  publisher: z.string(),
  topic: z.literal(env.MOSIP_WEBSUB_TOPIC),
  publishedOn: z.string().datetime(),
  event: z.object({
    id: z.string().uuid(),
    transactionId: z.string().uuid(),
    type: z.object({
      namespace: z.string(),
      name: z.string()
    }),
    timestamp: z.string().datetime(),
    data: z.object({
      registrationId: z.string(),
      credential: z.string(),
      credentialType: z.literal('vercred').or(z.literal('euin')),
      protectionKey: z.string()
    })
  })
})

export interface TokenPayload {
  eventId: string
  actionId: string
}

type CredentialIssuedRequest = FastifyRequest<{
  Body: z.infer<typeof CredentialIssuedSchema>
}>

/**
 * Authenticates the delivery before the body is validated, so nothing
 * downstream ever sees an unauthenticated payload. The route is deliberately
 * exempt from JWT auth (see the `onRequest` hook in `index.ts`) — this is what
 * establishes that the request came from MOSIP.
 */
export const credentialIssuedPreValidation = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    verifyHubSignatureOrThrow(
      request.headers['x-hub-signature'],
      request.rawBody
    )
  } catch (error) {
    request.log.error(
      { event: 'websub.credential-issued.unauthenticated', err: error },
      'Rejected WebSub callback with an invalid X-Hub-Signature'
    )

    return reply.code(401).send({ error: 'Invalid X-Hub-Signature' })
  }
}

export const credentialIssuedHandler = async (
  request: CredentialIssuedRequest,
  reply: FastifyReply
) => {
  try {
    const verifiableCredential = decryptMosipCredential(
      request.body.event.data.credential
    )

    const transactionId = verifiableCredential.credentialSubject.id
      .split('/')
      .pop()!

    const { token, registrationNumber } =
      getTransactionAndDiscard(transactionId)
    const { eventId, actionId } = decode(token) as TokenPayload

    // With client credentials configured, confirm with a freshly issued token:
    // it survives OpenCRVS redeployments that happened while the credential was
    // pending, and the confirmation is audited as this integration rather than
    // the registrar. The stored token remains as a fallback for deployments
    // that have not been issued client credentials yet.
    const confirmationToken = opencrvs.isDirectAuthConfigured()
      ? await opencrvs.getConfirmationToken(eventId, actionId)
      : token

    const actionInfo = await opencrvs.findEventActionType(eventId, { token })

    if (!actionInfo) {
      request.log.info(
        {
          event: 'websub.credential-issued.no-pending-action',
          eventId
        },
        'No pending action for event, skipping credential processing'
      )
      return reply
        .send({
          publisher: request.body.publisher,
          topic: request.body.topic,
          publishedOn: new Date().toISOString(),
          event: {
            id: request.body.event.id,
            requestId: request.body.event.transactionId,
            timestamp: new Date().toISOString(),
            status: 'RECEIVED',
            url: ''
          }
        })
        .status(200)
    }

    const { actionType, eventType, requestId } = actionInfo

    if (actionType === ActionType.REGISTER && eventType === 'birth') {
      await opencrvs.confirmRegistration(
        {
          eventId,
          actionId,
          registrationNumber,
          nationalId: getBirthIdentifier(verifiableCredential.credentialSubject)
        },
        { token: confirmationToken, logger: request.log }
      )
    }

    if (actionType === ActionType.REGISTER && eventType === 'death') {
      await opencrvs.confirmRegistration(
        {
          eventId,
          actionId,
          registrationNumber
        },
        { token: confirmationToken, logger: request.log }
      )
    }

    if (actionType === ActionType.APPROVE_CORRECTION && eventType === 'birth') {
      await opencrvs.confirmApprovedBirthCorrection(
        {
          eventId,
          actionId,
          requestId: requestId!,
          nationalId: getBirthIdentifier(verifiableCredential.credentialSubject)
        },
        { token, logger: request.log }
      )
    }

    return reply
      .send({
        publisher: request.body.publisher,
        topic: request.body.topic,
        publishedOn: new Date().toISOString(),
        event: {
          id: request.body.event.id,
          requestId: request.body.event.transactionId,
          timestamp: new Date().toISOString(),
          status: 'RECEIVED',
          url: ''
        }
      })
      .status(200)
  } catch (error) {
    request.log.error(
      {
        event: 'websub.credential-issued.failed',
        err: error,
        topic: request.body.topic,
        eventId: request.body.event.id
      },
      'Failed to process WebSub credential-issued event'
    )

    return reply
      .send({
        publisher: request.body.publisher,
        topic: request.body.topic,
        publishedOn: new Date().toISOString(),
        event: {
          id: request.body.event.id,
          requestId: request.body.event.transactionId,
          timestamp: new Date().toISOString(),
          status: 'ERROR',
          url: ''
        }
      })
      .status(200)
  }
}
