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
import { FastifyReply, FastifyRequest } from 'fastify'
import { getAllTransactions, getTransactionAndDiscard } from '../database'
import { EncodedScope, hasScope } from '@opencrvs/toolkit/scopes'
import { TokenPayload } from './websub-credential-issued'
import { decode } from 'jsonwebtoken'

interface AuthenticatedUser {
  scope: string[]
}

/**
 * Allow listing transactions for users that have the search scope.
 *
 * Rationale:
 * - Users with this scope would be able to see record UUID's and registration numbers in the UI anyway.
 *
 * NOTE: this check was `SCOPES.SEARCH_BIRTH && SCOPES.SEARCH_DEATH` while this
 * service tracked a v1.9 toolkit. Those per-event search scopes do not exist in
 * the v2 scope model — search collapsed into a single `record.search` carrying
 * event options — so the conjunction has no direct equivalent. A holder of
 * `record.search[event=birth]` alone now passes where they previously would not.
 */
const isAllowedToSearch = (scope: string[]) =>
  hasScope(scope as EncodedScope[], 'record.search')

/**
 * Allow deleting transactions for users that have `record.reject-registration` scope.
 *
 * Rationale:
 * - This should be accompanied with a `client.event.actions.register.reject` call via Postman which requires this scope.
 */
const isAllowedToDelete = (scope: string[]) =>
  hasScope(scope as EncodedScope[], 'record.reject-registration')

export const getAllTransactionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { scope } = request.user as AuthenticatedUser

  if (!isAllowedToSearch(scope)) {
    return reply.status(403).send({
      error: 'You do not have permission to access this resource.'
    })
  }

  const transactions = getAllTransactions()

  return transactions.map(({ token, ...rest }) => {
    const { eventId, actionId } = decode(token) as TokenPayload

    return {
      eventId,
      actionId,
      ...rest
    }
  })
}

export type DeleteTransactionRequest = FastifyRequest<{
  Params: { id: string }
}>

export const deleteTransactionHandler = async (
  request: DeleteTransactionRequest,
  reply: FastifyReply
) => {
  const { scope } = request.user as AuthenticatedUser

  if (!isAllowedToDelete(scope)) {
    return reply.status(403).send({
      error: 'You do not have permission to access this resource.'
    })
  }

  const { id } = request.params

  try {
    const transaction = getTransactionAndDiscard(id)

    reply.status(200).send(transaction)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred'

    reply.status(404).send({ error: message })
  }
}
